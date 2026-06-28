import { useFetcher } from "react-router";
import type { ActionFunctionArgs, HeadersFunction, LoaderFunctionArgs } from "react-router";
import { useState } from "react";
import { authenticate } from "../shopify.server";
import { boundary } from "@shopify/shopify-app-react-router/server";
import { connectMongo } from "../db/mongodb.server";
import Announcement from "../models/Announcement.server";

export const loader = async ({ request }: LoaderFunctionArgs) => {
  await authenticate.admin(request);
  return null;
};

export const action = async ({ request }: ActionFunctionArgs) => {
  try {
    // ✅ Destructure admin from authenticate
    const { admin } = await authenticate.admin(request);
    await connectMongo();

    const formData = await request.formData();
    const announcement = formData.get("announcement") as string;

    if (!announcement?.trim()) {
      return { success: false, error: "Announcement text is required." };
    }

    // Save to MongoDB
    await Announcement.create({ announcement });

    // Get shop ID
    const shopRes = await admin.graphql(`{ shop { id } }`);
    const shopData = await shopRes.json();
    const shopId = shopData.data.shop.id;

    // Save to Shopify metafield so theme liquid can read it
    await admin.graphql(
      `#graphql
      mutation metafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          userErrors { field message }
        }
      }`,
      {
        variables: {
          metafields: [
            {
              namespace: "my_app",
              key: "announcement",
              value: announcement,
              type: "single_line_text_field",
              ownerId: shopId,
            },
          ],
        },
      }
    );

    return { success: true };
  } catch (err) {
    console.error("Action error:", err);
    return { success: false, error: String(err) };
  }
};

export default function Index() {
  const fetcher = useFetcher<{ success: boolean; error?: string }>();
  const [announcement, setAnnouncement] = useState("");
  const isSubmitting = fetcher.state === "submitting";

  const handleSave = () => {
    if (!announcement.trim()) return;
    fetcher.submit({ announcement }, { method: "POST" });
    setAnnouncement("");
  };

  return (
    <div style={styles.page}>
      <div style={styles.content}>
        <h1 style={styles.pageTitle}>Announcement Dashboard</h1>

        <div style={styles.card}>
          {fetcher.data?.success && (
            <div style={styles.successBanner}>
              ✓ &nbsp; Announcement saved & live on your store!
            </div>
          )}
          {fetcher.data?.success === false && (
            <div style={styles.errorBanner}>
              ✕ &nbsp; {fetcher.data.error || "Something went wrong."}
            </div>
          )}

          <label htmlFor="announcement-text" style={styles.label}>
            Announcement Text
          </label>

          <textarea
            id="announcement-text"
            value={announcement}
            onChange={(e) => setAnnouncement(e.target.value)}
            placeholder="Enter announcement... e.g. Sale 50% Off"
            rows={5}
            style={styles.textarea}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "#005bd3";
              e.currentTarget.style.boxShadow = "0 0 0 3px rgba(0,91,211,0.15)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "#c9cccf";
              e.currentTarget.style.boxShadow = "none";
            }}
          />

          <button
            onClick={handleSave}
            disabled={isSubmitting || !announcement.trim()}
            style={{
              ...styles.saveBtn,
              opacity: isSubmitting || !announcement.trim() ? 0.55 : 1,
              cursor: isSubmitting || !announcement.trim() ? "not-allowed" : "pointer",
            }}
            onMouseEnter={(e) => {
              if (!isSubmitting && announcement.trim())
                e.currentTarget.style.backgroundColor = "#1a6b3c";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.backgroundColor = "#1a7f4b";
            }}
          >
            {isSubmitting ? "Saving…" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    minHeight: "100vh",
    backgroundColor: "#f1f1f1",
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
  },
  content: {
    maxWidth: "860px",
    margin: "0 auto",
    padding: "40px 24px",
  },
  pageTitle: {
    fontSize: "26px",
    fontWeight: "700",
    color: "#1a1a1a",
    margin: "0 0 20px 0",
    letterSpacing: "-0.3px",
  },
  card: {
    backgroundColor: "#ffffff",
    border: "1px solid #e1e3e5",
    borderRadius: "12px",
    padding: "24px",
    boxShadow: "0 1px 4px rgba(0,0,0,0.07)",
  },
  successBanner: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#e8f5ee",
    border: "1px solid #a8d5b8",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#1a5c3a",
    fontWeight: "500",
  },
  errorBanner: {
    display: "flex",
    alignItems: "center",
    backgroundColor: "#fff4f4",
    border: "1px solid #fba8a8",
    borderRadius: "8px",
    padding: "12px 16px",
    marginBottom: "20px",
    fontSize: "14px",
    color: "#7a0000",
    fontWeight: "500",
  },
  label: {
    display: "block",
    fontSize: "14px",
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: "8px",
  },
  textarea: {
    width: "100%",
    padding: "10px 12px",
    fontSize: "14px",
    color: "#1a1a1a",
    backgroundColor: "#fff",
    border: "1px solid #c9cccf",
    borderRadius: "8px",
    resize: "vertical",
    outline: "none",
    lineHeight: "1.6",
    boxSizing: "border-box",
    transition: "border-color 0.15s ease, box-shadow 0.15s ease",
    fontFamily: "inherit",
    marginBottom: "16px",
  },
  saveBtn: {
    backgroundColor: "#1a7f4b",
    color: "#ffffff",
    fontSize: "14px",
    fontWeight: "600",
    padding: "10px 24px",
    border: "none",
    borderRadius: "8px",
    transition: "background-color 0.15s ease",
    minWidth: "90px",
  },
};

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};
