"use client";
import Link from "next/link";
import { useFormik } from "formik";
import * as Yup from "yup";
import { resendOtp, verifyOtp } from "../../../network/user.api"; // Changed: Import checkOTP instead of checkPassword
import { useRouter, useSearchParams } from "next/navigation";
import toast from "react-hot-toast";
import { useEffect, useState } from "react";

const Page = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [userData, setUserData] = useState({});

  useEffect(() => {
    const data = searchParams.get("data");
    if (data) {
      const parsedData = JSON.parse(data);
      console.log(parsedData);
      setUserData(parsedData);
    } else {
      router.push("/check-mail");
    }
  }, [router, searchParams]);

  const formik = useFormik({
    initialValues: {
      otp: "", // Changed: Replace password with otp for OTP verification
    },
    validationSchema: Yup.object({
      otp: Yup.string() // Changed: Validate OTP instead of password
        .required("OTP is Required")
        .length(6, "OTP must be 6 digits"), // Added: OTP validation rule (assuming 6-digit OTP)
    }),
    onSubmit: async (values) => {
      try {
        const result = await verifyOtp({
          ...values, // Pass OTP in the request
          email: userData,
        });
        if (result?.data?.success) {
          toast.success(result.data.message);
          formik.resetForm();
          localStorage.setItem("token", result?.data?.token);
          router.push(`/check-mail`);
        }
      } catch (error) {
        toast.error(error?.response?.data?.message);
      }
    },
  });

  //--------
  const resendOtpHandler = async (e) => {
    e.preventDefault(); // Prevent link default navigation

    try {
      const result = await resendOtp({
        email: userData,
      });
      console.log(result?.data?.success)
      if (result?.data?.success) {
        console.log(result.data.message);
        toast.success(result.data.message);
        console.log("hamada2");

      }
    } catch (error) {
      toast.error("An error occurred while resending OTP.");
    }
  };
  //-------

  const { values, handleChange, handleBlur, handleSubmit, errors, touched } =
    formik;
  return (
    <div className="mt-4 flex justify-center items-center w-full h-full">
      <div className="bg-white w-full max-w-md rounded overflow-hidden p-4 mx-auto shadow-md mt-8">
        <h3 className="w-full text-center text-primary font-semibold text-2xl mb-5  ">
          Welcome to Talky Chat App!
        </h3>
        <form onSubmit={handleSubmit} className="grid gap-4 mt-5">
          <div className="flex flex-col gap-1 mb-1">
            <label htmlFor="otp">OTP:</label> {/* Changed: Label now refers to OTP */}
            <input
              type="text" // Changed: OTP is usually text, not password
              name="otp" // Changed: Input name changed to otp
              id="otp" // Changed: Input ID changed to otp
              placeholder="Enter your OTP" // Changed: Placeholder text updated
              className="bg-slate-100 px-2 py-1 focus:outline-primary"
              value={values["otp"]} // Changed: Binding to OTP value
              onChange={handleChange}
              onBlur={handleBlur}
              required
            />
            {touched["otp"] && errors["otp"] ? ( // Changed: Error handling for OTP
              <div className="text-red-500 text-sm">{errors["otp"]}</div>
            ) : null}
          </div>

          <button
            type="submit"
            disabled={!formik.dirty || !formik.isValid}
            className="bg-primary text-lg px-4 disabled:bg-secondary hover:bg-secondary rounded mt-2 font-bold text-white leading-relaxed tracking-wide"
          >
            Verify OTP {/* Changed: Button text updated to "Verify OTP" */}
          </button>
        </form>

        <p className="my-3 text-center">
          <Link
            href={"#"}
            className="text-primary hover:text-secondary font-semibold"
            onClick={resendOtpHandler}
          >
            Resend OTP {/* Changed: Link text updated to "Forgot OTP?" */}
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Page;
