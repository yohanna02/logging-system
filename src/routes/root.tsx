import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "@/components/ui/drawer";
import { IoIdCardSharp } from "react-icons/io5";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Localbase from "localbase";
import { useMutation, useQuery } from "@tanstack/react-query";
import UsersList from "@/components/UsersList";
import AccessLogs from "@/components/AccessLogs";
import { columns } from "@/components/columns";

/* eslint-disable @typescript-eslint/no-explicit-any */
declare global {
  interface Navigator {
    serial: any;
  }
}

export default function Root() {
  const [connected, setConnected] = useState(false);
  const portRef = useRef();

  const [cardId, setCardId] = useState("");

  async function requestSerialDevice() {
    try {
      const usbVendorId = 9025;
      const port = await navigator.serial.requestPort({
        filters: [{ usbVendorId }],
      });
      portRef.current = port;
      await port.open({ baudRate: 9600 });

      const decoder = new TextDecoderStream();
      port.readable.pipeTo(decoder.writable);
      const reader = decoder.readable.getReader();

      let buffer = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) {
          reader.releaseLock();
          break;
        }
        buffer += value;

        // Check if the buffer contains a newline character
        let newlineIndex;
        while ((newlineIndex = buffer.indexOf("\n")) !== -1) {
          // Extract the complete line (up to the newline character)
          const line = buffer.slice(0, newlineIndex + 1).trim(); // `.trim()` to remove \n or \r\n
          buffer = buffer.slice(newlineIndex + 1); // Remove processed line from buffer

          // Process the complete line of data
          console.log(`Received: ${line}`);
        }
      }
    } catch (_e: unknown) {
      alert("Failed to connect");
      setConnected(false);
    }
  }

  const { data: dbInstance } = useQuery({
    queryKey: ["localDB"],
    queryFn: async () => {
      const localDB = new Localbase("db");
      return localDB;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    enabled: dbInstance !== undefined,
    queryFn: async function () {
      const users = await dbInstance?.collection("users").get();
      return users;
    },
  });

  const accessLogsQuery = useQuery({
    queryKey: ["accessLogs"],
    enabled: dbInstance !== undefined,
    queryFn: async function () {
      const accessLogs = await dbInstance?.collection("accessLogs").get();
      return accessLogs;
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async function (user: { name: string; cardId: string }) {
      const userExists = await dbInstance
        ?.collection("users")
        .doc({ cardId: user.cardId })
        .get();
      if (userExists) {
        throw new Error("User already exists");
      }
      await dbInstance?.collection("users").add(user);
    },
    onSuccess: function () {
      usersQuery.refetch();
      alert("Added users successfully");
    },
    onError: function (error) {
      alert(error.message);
    },
  });

  const removeUsersMutation = useMutation({
    mutationFn: async function (datas: any[]) {
      for (const data of datas) {
        await dbInstance
          ?.collection("users")
          .doc({ cardId: data.cardId })
          .delete();
      }
    },
    onSuccess: function () {
      usersQuery.refetch();
      alert("Deleted users successfully");
    },
  });

  useEffect(function () {
    navigator.serial.addEventListener("connect", () => {
      setConnected(true);
    });

    navigator.serial.addEventListener("disconnect", () => {
      setConnected(false);
    });
  }, []);

  return (
    <div className="flex flex-col">
      <p className="text-center">{connected ? "Connected" : "Disconnected"}</p>
      <Button onClick={requestSerialDevice} className="w-fit mx-auto mt-5">
        Connect
      </Button>

      <Drawer>
        <DrawerTrigger asChild>
          <Button variant="default" className="w-fit mx-auto mt-5">
            Add new user
          </Button>
        </DrawerTrigger>
        <DrawerContent>
          <form
            className="mx-auto w-full max-w-sm"
            onSubmit={(e) => {
              e.preventDefault();
              const form = e.currentTarget;
              const formData = new FormData(form);
              const name = formData.get("name") as string;
              const cardId = formData.get("cardId") as string;

              addUserMutation.mutateAsync({ name, cardId });
              form.reset();
            }}
          >
            <DrawerHeader>
              <DrawerTitle>Add new user</DrawerTitle>
            </DrawerHeader>
            <div className="p-4 pb-0">
              <label className="block">
                <span className="text-gray-700">Name</span>
                <input
                  type="text"
                  name="name"
                  className="form-input mt-1 block w-full border-black p-2 border-2 rounded"
                  placeholder="John Doe"
                />
              </label>

              <div className="flex justify-center items-center flex-col mt-5">
                <p className="text-center text-lg">Scan card</p>
                <input
                  type="text"
                  name="cardId"
                  value={cardId}
                  onChange={(e) => setCardId(e.currentTarget.value)}
                  className="hidden"
                />
                <IoIdCardSharp size={200} color="green" />
              </div>
            </div>
            <DrawerFooter>
              <Button type="submit" disabled={addUserMutation.isPending}>
                {addUserMutation.isPending ? "Adding..." : "Add user"}
              </Button>
              <DrawerClose asChild>
                <Button type="reset" variant="outline">
                  Cancel
                </Button>
              </DrawerClose>
            </DrawerFooter>
          </form>
        </DrawerContent>
      </Drawer>

      <Tabs defaultValue="logs" className="w-4/5 mx-auto mt-10">
        <TabsList className="mx-auto">
          <TabsTrigger value="logs">Access logs</TabsTrigger>
          <TabsTrigger value="user-list">Users</TabsTrigger>
        </TabsList>
        <TabsContent value="logs">
          <AccessLogs logs={accessLogsQuery.data || []} />
        </TabsContent>
        <TabsContent value="user-list">
          <UsersList
            columns={columns}
            data={usersQuery.data || []}
            deleteHandler={removeUsersMutation.mutate}
          />
        </TabsContent>
      </Tabs>
    </div>
  );
}
