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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useMutation, useQuery } from "@tanstack/react-query";
import UsersList from "@/components/UsersList";
import AccessLogs from "@/components/AccessLogs";
import { columns } from "@/components/columns";
import { standardFetch } from "@/lib/axios";
import axios from "axios";

interface UsersType {
  name: string;
  cardId: string;
  fingerprintId: string;
}

export default function Root() {
  const keepServerAlive = useQuery({
    queryKey: ["keepServerAlive"],
    queryFn: async function () {
      const { data } = await axios.get(
        "https://google-sheet-attendance-system.onrender.com"
      );
      return data;
    },
  });

  const usersQuery = useQuery({
    queryKey: ["users"],
    queryFn: async function () {
      const { data: users } = await standardFetch.get<UsersType[]>("/", {
        params: {
          action: "get_users",
          data1: "data1",
          data2: "data2",
        },
      });

      return users.slice(1);
    },
  });

  const accessLogsQuery = useQuery({
    queryKey: ["accessLogs"],
    queryFn: async function () {
      const { data: accessLogs } = await standardFetch.get("/", {
        params: {
          action: "get",
          data1: "data1",
          data2: "data2",
        },
      });
      return accessLogs.slice(1);
    },
  });

  const addUserMutation = useMutation({
    mutationFn: async function (name: string) {
      await standardFetch.get("/", {
        params: {
          action: "name",
          data1: name,
          data2: "data2",
        },
      });
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mutationFn: async function (data: any[]) {
      for (const user of data) {
        await standardFetch.get("/", {
          params: {
            action: "remove",
            data1: user.cardId,
            data2: user.fingerprintId,
          },
        });
      }
    },
    onSuccess: function () {
      usersQuery.refetch();
      alert("Deleted users successfully");
    },
  });

  if (keepServerAlive.isLoading) {
    return (
      <div className="h-screen flex justify-center items-center">
        <p className="text-2xl">Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <Button
        className="w-fit mx-auto mt-5 disabled:opacity-50 disabled:!cursor-not-allowed"
        onClick={() => {
          usersQuery.refetch();
          accessLogsQuery.refetch();
        }}
        disabled={usersQuery.isFetching || accessLogsQuery.isFetching}
      >
        {usersQuery.isFetching || accessLogsQuery.isFetching
          ? "Refreshing"
          : "Refresh"}
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

              if (name.trim() === "") {
                alert("Name field can not be empty");
                return;
              }

              addUserMutation.mutateAsync(name);
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
