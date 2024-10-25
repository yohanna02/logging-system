import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

function formatDate(date: string | Date) {
  date = new Date(date);
  const formattedDate = date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric"
  });

  // Add suffix for the day
  const day = date.getDate();
  const suffix = (day: number) => {
      if (day > 3 && day < 21) return "th"; // Special case for 11-13
      return ["th", "st", "nd", "rd"][day % 10] || "th";
  };

  return formattedDate.replace(/\d+/, day + suffix(day));
}

export default function AccessLogs({
  logs,
}: {
  logs: { name: string; date: string; cardId: string }[];
}) {
  return (
    <Table>
      <TableCaption>A list of your recent access.</TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[100px]">Name</TableHead>
          <TableHead>Time/Date</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {logs.map((log) => (
          <TableRow key={log.cardId}>
            <TableCell>{log.name}</TableCell>
            <TableCell>{new Date(log.date).toLocaleTimeString()} - {formatDate(log.date)}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
