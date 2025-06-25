import { useGetUserProfileQuery } from "../redux/profileAuthApi/profileAuthApi";
import profileIcon from "/profileIconBrown.jpeg";



// read the env var
const API_BASE = import.meta.env.VITE_API_BASE;

// log it so you know what the running code is actually using
console.log('🛰️ API_BASE is:', API_BASE);



const useUserProfile = () => {
  // Fetch user profile
  const { data: userProfile, refetch, isLoading, error } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true, // Forces refetch on component mount
  });

  let profileImageUrl = profileIcon;

  if (userProfile?.image) {
    const timestamp = new Date().getTime();
    profileImageUrl = `${API_BASE}/uploads/${userProfile.image.split("/").pop()}?t=${timestamp}`;
  }

  return { userProfile, profileImageUrl, refetch, isLoading, error };
};

export default useUserProfile;
