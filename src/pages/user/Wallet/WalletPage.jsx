import UserWallet from '../../../components/Wallet/UserWallet'
import UserSidebar from '../../../components/UserProfile/UserSidebar';

function WalletPage() {
    return (
        <div className="flex min-h-screen ">
          <UserSidebar />
          <main className="flex-1 p-8">
            <UserWallet />
          </main>
        </div>
      );
}

export default WalletPage