'use client';
import { createContext, useContext, useState, useEffect } from "react";
import { useUser } from "@clerk/nextjs";
import axios from "axios";

const UserDetailContext = createContext(null);

export const UserDetailProvider = ({ children }) => {
    const { user, isLoaded } = useUser();
    const [userDetail, setUserDetail] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (isLoaded && user) {
            syncUser();
        } else if (isLoaded && !user) {
            setLoading(false);
        }
    }, [user, isLoaded]);

    const syncUser = async () => {
        try {
            const response = await axios.post('/api/user/sync', {
                user: {
                    name: user.fullName,
                    email: user.primaryEmailAddress.emailAddress,
                    imageUrl: user.imageUrl
                }
            });
            setUserDetail(response.data.result);
        } catch (error) {
            console.error("Error syncing user:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <UserDetailContext.Provider value={{ userDetail, setUserDetail, loading }}>
            {children}
        </UserDetailContext.Provider>
    );
};

export const useUserDetail = () => {
    const context = useContext(UserDetailContext);
    if (!context) {
        throw new Error("useUserDetail must be used within a UserDetailProvider");
    }
    return context;
};
