import { Button } from "@/components/ui/button";
import Link from "next/link";
import "./globals.css";
export default function Home() {
  return (
    <div>
      Chaya Website
      <Link href="/login" passHref>
        <Button>Go to login</Button>
      </Link>
    </div>
  );
}
