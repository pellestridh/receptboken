import { redirect } from "next/navigation";
export default function Old({ params }) { redirect(`/dryck/lar/vin/${params.lektion}`); }
