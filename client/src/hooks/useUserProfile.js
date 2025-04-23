import { useGetUserProfileQuery } from "../redux/profileAuthApi/profileAuthApi";
import profileIcon from "/profileIconBrown.jpeg";

const useUserProfile = () => {
  // Fetch user profile
  const { data: userProfile, refetch, isLoading, error } = useGetUserProfileQuery(undefined, {
    refetchOnMountOrArgChange: true, // Forces refetch on component mount
  });

  let profileImageUrl = profileIcon;

  if (userProfile?.image) {
    const timestamp = new Date().getTime();
    profileImageUrl = `http://localhost:5000/uploads/${userProfile.image.split("/").pop()}?t=${timestamp}`;
  }

  return { userProfile, profileImageUrl, refetch, isLoading, error };
};

export default useUserProfile;
