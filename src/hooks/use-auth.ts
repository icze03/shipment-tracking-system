"use client";

import { useState, useEffect, useCallback } from "react";
import type { UserProfile, UserRole } from "@/lib/types";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useFirebase, useUser } from "@/firebase";
import { signInAnonymously, signOut } from "firebase/auth";

export function useAuth() {
  const { auth, firestore } = useFirebase();
  const { user: firebaseUser, isUserLoading } = useUser();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUserProfile = useCallback(async (uid: string, role: UserRole) => {
    if (!firestore) return;
    const userDocRef = doc(firestore, "users", uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      setUser(userDoc.data() as UserProfile);
    } else {
      // Create user profile if it doesn't exist
      const newUser: UserProfile = {
        uid,
        role,
        name: role === 'admin' ? 'Admin User' : `Driver ${uid.substring(0, 5)}`,
        email: `${role}@trucktrack.com`,
      };
      await setDoc(userDocRef, newUser);
      setUser(newUser);
    }
    setIsLoading(false);
  }, [firestore]);


  useEffect(() => {
    setIsLoading(isUserLoading);
    if (!isUserLoading && firebaseUser) {
        // This is a simplified auth system. In a real app, you'd have a more robust way
        // to determine or store a user's role. Here we check a mock session storage
        // or default to a role if needed.
        const storedRole = sessionStorage.getItem("trucktrack_role") as UserRole | null;
        if(storedRole) {
            fetchUserProfile(firebaseUser.uid, storedRole);
        } else {
            // If no role is stored, check the user's profile in Firestore
            const userDocRef = doc(firestore, "users", firebaseUser.uid);
            getDoc(userDocRef).then(userDoc => {
                if (userDoc.exists()) {
                    setUser(userDoc.data() as UserProfile);
                }
                setIsLoading(false);
            });
        }
    } else if (!isUserLoading && !firebaseUser) {
        setUser(null);
        setIsLoading(false);
    }
  }, [firebaseUser, isUserLoading, fetchUserProfile, firestore]);

  const login = async (role: UserRole) => {
    setIsLoading(true);
    try {
      const userCredential = await signInAnonymously(auth);
      sessionStorage.setItem("trucktrack_role", role); // Store role for session
      await fetchUserProfile(userCredential.user.uid, role);
    } catch (error) {
      console.error("Anonymous sign-in failed", error);
      setIsLoading(false);
    }
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await signOut(auth);
      sessionStorage.removeItem("trucktrack_role");
      setUser(null);
    } catch (error) {
      console.error("Sign-out failed", error);
    } finally {
      setIsLoading(false);
    }
  };

  return { user, isLoading, login, logout };
}
