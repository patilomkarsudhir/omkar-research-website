import Section from "../components/Section";
import { Metadata } from "next";
import FunStuffClient from "./fun-stuff-client";

export const metadata: Metadata = {
  title: "Fun Stuff - Omkar Patil",
  description: "Fun projects, experiments, and creative explorations.",
  alternates: {
    canonical: "/fun-stuff",
  },
};

export default function Page() {
  return <FunStuffClient />;
}
