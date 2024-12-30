import AddressManager from "../../../components/UserAddress/AddressManager";
import UserSidebar from "../../../components/UserProfile/UserSidebar";
export default function AddressPage() {
  return (
    <div className="flex min-h-screen bg-gray-100">
      <UserSidebar />
      <main className="flex-1 p-8">
        <AddressManager />
      </main>
    </div>
  );
}
