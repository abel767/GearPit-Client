// import UserProfileNavbar from '../../../components/UserProfile/UserProfileNavbar';
import UserSidebar from '../../../components/UserProfile/UserSidebar';
import UserOrderHistory from '../../../components/UserOrderManagement/UserOrderHistory';
export default function OrderHistory() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* <UserProfileNavbar /> */}
      <div className="flex">
        <UserSidebar />
        <UserOrderHistory />
      </div>
    </div>
  );
}

