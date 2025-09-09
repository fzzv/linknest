import { Card } from "@linknest/ui/card";

export default function Home() {
  return <div>
    <h1>LinkNest</h1>
    <button className="btn btn-primary btn-outline">Click me</button>
    <Card
      title="LinkNest"
      description="LinkNest is a platform for creating and managing your links"
      href="https://xyu.fan"
    >
      <p>LinkNest is a platform for creating and managing your links</p>
    </Card>
  </div>;
}
