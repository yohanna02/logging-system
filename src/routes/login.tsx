import { Form, useNavigate } from "react-router-dom";
import { LoginContext } from "../context/LoginContext";
import { useContext } from "react";
import { Button } from "@/components/ui/button";

export default function Login() {
  const { setLoginedIn } = useContext(LoginContext);
  const navigate = useNavigate();

  return (
    <div className="flex min-h-full flex-1 flex-col justify-center px-6 py-12 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-sm">
        <img
          alt="Your Company"
          src="https://tailwindui.com/plus/img/logos/mark.svg?color=indigo&shade=600"
          className="mx-auto h-10 w-auto"
        />
        <h2 className="mt-10 text-center text-2xl font-bold leading-9 tracking-tight text-gray-900">
          Login
        </h2>
      </div>

      <div className="mt-10 sm:mx-auto sm:w-full sm:max-w-sm">
        <Form
          onSubmit={(e) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);

            if (formData.get("password") === "2222222222") {
              alert("Login successful");
              setLoginedIn(true);
              navigate("/");
              // Navigate to the root page
            } else {
              alert("Login failed");
            }
          }}
          method="POST"
          className="space-y-6"
        >
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium leading-6 text-gray-900"
            >
              Password
            </label>
            <div className="mt-2">
              <input
                id="password"
                name="password"
                type="password"
                required
                autoComplete="current-password"
                className="block w-full rounded-md border-0 py-1.5 pl-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              className="w-full"
            >
              Login
            </Button>
          </div>
        </Form>
      </div>
    </div>
  );
}
