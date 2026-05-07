"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";

export default function AdminLoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  return (
    <section className="container-dala section-space max-w-xl">
      <h1 className="font-serif text-5xl">Admin login</h1>
      <form
        className="mt-8 space-y-6"
        onSubmit={async (e) => {
          e.preventDefault();
          setError("");
          const result = await signIn("credentials", {
            email,
            password,
            callbackUrl: "/",
            redirect: false,
          });
          if (result?.error) {
            setError("Неверные данные");
            return;
          }
          window.location.href = "/";
        }}
      >
        <input
          placeholder="Email"
          className="w-full border-b border-black bg-transparent py-2 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          className="w-full border-b border-black bg-transparent py-2 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button className="btn-primary px-8 py-4 text-sm uppercase tracking-[0.12em]">Sign in</button>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
      </form>
    </section>
  );
}
