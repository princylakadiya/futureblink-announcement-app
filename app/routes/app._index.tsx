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
    const { admin, session } = await authenticate.admin(request);

    await connectMongo();

    const formData = await request.formData();
    const announcement = formData.get("announcement") as string;

    // Step 1: MongoDB mein save karo
    await Announcement.create({ announcement });
    console.log("✅ MongoDB mein save hua");

    // Step 2: Shopify Metafield mein save karo
    const response = await admin.graphql(`
      mutation MetafieldsSet($metafields: [MetafieldsSetInput!]!) {
        metafieldsSet(metafields: $metafields) {
          metafields {
            id
            namespace
            key
            value
          }
          userErrors {
            field
            message
          }
        }
      }
    `, {
      variables: {
        metafields: [
          {
            namespace: "my_app",
            key: "announcement",
            value: announcement,
            type: "single_line_text_field",
            ownerId: `gid://shopify/Shop/${session.shop.replace('.myshopify.com', '')}`,
          }
        ]
      }
    });

    const data = await response.json();
    console.log("✅ Metafield save hua:", JSON.stringify(data));

    return { success: true };
  } catch (err) {
    console.error("❌ Error:", err);
    return { success: false, error: String(err) };
  }
};

export default function Index() {
  const fetcher = useFetcher();
  const [announcement, setAnnouncement] = useState("");

  return (
    <div style={{ padding: "20px", maxWidth: "600px" }}>
      <h1>Announcement Dashboard</h1>
      <div style={{ marginBottom: "10px" }}>
        <label><strong>Announcement Text</strong></label>
        <br />
        <textarea
          value={announcement}
          onChange={(e) => setAnnouncement(e.target.value)}
          placeholder="Enter announcement... e.g. Sale 50% Off"
          rows={4}
          style={{ width: "100%", padding: "8px", marginTop: "8px", fontSize: "16px" }}
        />
      </div>
      <button
        onClick={() => fetcher.submit({ announcement }, { method: "POST" })}
        disabled={fetcher.state === "submitting"}
        style={{ 
          padding: "10px 24px", 
          background: "#008060", 
          color: "white", 
          border: "none", 
          cursor: "pointer",
          fontSize: "16px",
          borderRadius: "4px"
        }}
      >
        {fetcher.state === "submitting" ? "Saving..." : "Save"}
      </button>

      {fetcher.data?.success && (
        <p style={{ color: "green", marginTop: "10px" }}>✅ Announcement saved to MongoDB & Shopify!</p>
      )}
      {fetcher.data?.error && (
        <p style={{ color: "red", marginTop: "10px" }}>❌ Error: {fetcher.data.error}</p>
      )}
    </div>
  );
}

export const headers: HeadersFunction = (headersArgs) => {
  return boundary.headers(headersArgs);
};