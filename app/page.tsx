import Link from "next/link";

export default function Home() {
  return (
    <div>
      <Link
        href="/adminlogin"
        className="text-blue-600 hover:text-blue-800 font-medium"
      >
        Login
      </Link>
    </div>
  );
}
