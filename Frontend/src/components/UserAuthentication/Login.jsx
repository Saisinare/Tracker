import { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import * as Yup from "yup";
import { Typography, Input, Button } from "@material-tailwind/react";
import { EyeSlashIcon, EyeIcon } from "@heroicons/react/24/solid";

// Validation schema using Yup
const validationSchema = Yup.object({
  email: Yup.string().email("Invalid email address").required("Required"),
  password: Yup.string().required("Required"),
});

export default function Login() {
  const [passwordShown, setPasswordShown] = useState(false);
  const togglePasswordVisibility = () => setPasswordShown((cur) => !cur);

  const initialValues = {
    email: "",
    password: "",
  };

  const onSubmit = (values) => {
    console.log("Form data", values);
  };

  return (
    <section className="flex text-center h-auto z-0 items-center justify-center p-8">
      <div className="h-auto p-10 w-2/5 border-2 border-black items-center justify-center bg-white">
        <Typography variant="h3" color="blue-gray" className="mb-2">
          Sign In
        </Typography>
        <Typography className="mb-16 text-gray-600 font-normal text-sm">
          Enter your email and password to sign in
        </Typography>
        <Formik
          initialValues={initialValues}
          validationSchema={validationSchema}
          onSubmit={onSubmit}
        >
          {({ errors, touched }) => (
            <Form className="mx-auto max-w-[24rem] text-left">
              <div className="mb-6">
                <label htmlFor="email">
                  <Typography
                    variant="small"
                    className="mb-2 block font-medium text-gray-900"
                  >
                    Your Email
                  </Typography>
                </label>
                <Field
                  as={Input}
                  id="email"
                  name="email"
                  type="email"
                  placeholder="name@mail.com"
                  className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"
                />
                <ErrorMessage name="email" component="div" className="text-red-500 mt-2 text-xs" />
              </div>
              <div className="mb-6">
                <label htmlFor="password">
                  <Typography
                    variant="small"
                    className="mb-2 block font-medium text-gray-900"
                  >
                    Password
                  </Typography>
                </label>
                <div className=" flex">
                  <Field
                    as={Input}
                    id="password"
                    name="password"
                    type={passwordShown ? "text" : "password"}
                    placeholder="********"
                    className="w-full placeholder:opacity-100 focus:border-t-primary border-t-blue-gray-200"s
                  />
                  <i onClick={togglePasswordVisibility} className=" absolute ml-[22rem] mt-3">
                    {passwordShown ? (
                      <EyeIcon className="h-5 w-5" />
                    ) : (
                      <EyeSlashIcon className="h-5 w-5" />
                    )}
                  </i>
                </div>
                <ErrorMessage name="password" component="div" className="text-red-500 mt-2 text-xs" />
              </div>
              <Button color="black" size="lg" className="mt-6 rounded-none" fullWidth>
                Sign In
              </Button>
              <div className="!mt-4 flex justify-end">
                <Typography
                  as="a"
                  href="#"
                  color="blue-gray"
                  variant="small"
                  className="font-medium"
                >
                  Forgot password
                </Typography>
              </div>
              <Button
                variant="outlined"
                size="lg"
                className="mt-6 flex h-12 items-center justify-center gap-2 rounded-none"
                fullWidth
              >
                <img
                  src={`https://www.material-tailwind.com/logos/logo-google.png`}
                  alt="google"
                  className="h-6 w-6 rounded"
                />
                Sign in with Google
              </Button>
              <Typography
                variant="small"
                color="gray"
                className="!mt-4 text-center font-normal"
              >
                Not registered?{" "}
                <a href="#" className="font-medium text-gray-900">
                  Create account
                </a>
              </Typography>
            </Form>
          )}
        </Formik>
      </div>
    </section>
  );
}
