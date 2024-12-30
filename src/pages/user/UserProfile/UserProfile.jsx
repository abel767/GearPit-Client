// import UserProfileNavbar from '../../../components/UserProfile/UserProfileNavbar';
import UserSidebar from '../../../components/UserProfile/UserSidebar';
import Profile from '../../../components/UserProfile/Profile';
export default function UserProfile() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <UserProfileNavbar /> */}
      <div className="flex">
        <UserSidebar />
        <Profile />
      </div>
    </div>
  );
}

