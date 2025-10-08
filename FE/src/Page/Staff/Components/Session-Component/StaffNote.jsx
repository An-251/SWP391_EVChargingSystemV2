import { Card, Button, Input } from "antd";
import { PlusOutlined, FileTextOutlined } from "@ant-design/icons";

export default function StaffNotes() {
  const notes = [
    {
      id: 1,
      author: "System Note",
      time: "May 15, 2023 - 11:20 AM",
      content:
        "Payment processed automatically. Customer received email receipt.",
      isSystem: true,
    },
    {
      id: 2,
      author: "Jane Smith",
      time: "May 15, 2023 - 01:45 PM",
      content:
        "Customer called to confirm receipt. Verified all details are correct.",
      isSystem: false,
    },
  ];

  return (
    <Card
      title={
        <div className="flex justify-between items-center">
          <span className="text-gray-800 font-semibold">Staff Notes</span>
          <Button
            type="link"
            icon={<PlusOutlined />}
            className="text-blue-600 font-medium"
          >
            Add Note
          </Button>
        </div>
      }
      className="shadow-md rounded-xl"
    >
      <div className="space-y-4">
        {notes.map((note) => (
          <div
            key={note.id}
            className="bg-gray-50 p-3 rounded-lg border border-gray-200 flex gap-3"
          >
            <div className="bg-blue-100 p-2 rounded-lg h-fit">
              <FileTextOutlined className="text-blue-600 text-lg" />
            </div>
            <div className="flex-1">
              <div className="flex justify-between text-sm">
                <span className="font-medium text-gray-800">{note.author}</span>
                <span className="text-gray-500 text-xs">{note.time}</span>
              </div>
              <p className="text-gray-600 text-xs mt-1 leading-snug">
                {note.content}
              </p>
            </div>
          </div>
        ))}

        <Input.TextArea
          rows={3}
          placeholder="Add a new note..."
          className="border border-gray-300 rounded-lg text-sm text-gray-600"
        />
      </div>
    </Card>
  );
}
