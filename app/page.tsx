import Link from "next/link";

export default function Home() {
  return (
    <div style={{ padding: 40 }}>
      <h1>CRM Home</h1>

      <div style={{ marginTop: 20 }}>
        <Link href="/dashboard">Go to Dashboard</Link>
      </div>
    </div>
  );
}
