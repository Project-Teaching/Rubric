import { collection, getDocs, limit, query, where } from "firebase/firestore";
import type { PageLoad } from "./$types";
import { db } from "$lib/firebase";
import { error } from "@sveltejs/kit";

export const load = (async ({ params }) => {

  const collectionRef = collection(db, "users");

  const q = query(
    collectionRef,
    where("username", "==", params.username),
    limit(1)
  );
  const snapshot = await getDocs(q);
  const exists = snapshot.docs[0]?.exists();
  const data = snapshot.docs[0]?.data();

  if (!exists) {
    throw error(404, "Este usuário não existe!");
  }

  if (!data.published) {
    throw error(403, `O perfil de @${data.username} não é público!`);
  }

  return {
    username: data.username,
    photoURL: data.photoURL,
    bio: data.bio,
    links: data.links ?? [],
  };
}) satisfies PageLoad;