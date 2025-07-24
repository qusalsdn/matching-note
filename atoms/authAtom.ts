import { atom } from "jotai";

export const isLoggedInAtom = atom<boolean>(false);

export const userIdAtom = atom<number>(0);

export const userUuidAtom = atom<string>("");
