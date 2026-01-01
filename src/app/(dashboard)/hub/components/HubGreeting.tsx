export function HubGreeting({ userName }: { userName: string }) {
  const now = new Date();
  const hour = now.getHours();
  const firstName = userName.split(" ")[0];

  let greeting: string;
  if (hour < 12) {
    greeting = "Good morning";
  } else if (hour < 17) {
    greeting = "Good afternoon";
  } else {
    greeting = "Good evening";
  }

  const dateStr = now.toLocaleDateString("en-US", {
    weekday: "long",
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="mb-2">
      <h1 className="text-2xl font-semibold text-gray-900">
        {greeting}, {firstName}
      </h1>
      <p className="text-gray-500 text-sm mt-1">{dateStr}</p>
    </div>
  );
}
