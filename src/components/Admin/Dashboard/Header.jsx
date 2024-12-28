import { Search, Bell } from 'lucide-react'

export default function Header() {
  return (
    <div className="flex justify-between items-center p-4 border-b">
      <h1 className="text-2xl font-semibold">Dashboard</h1>
      
      <div className="flex items-center space-x-4">
        <div className="relative">
          <input
            type="text"
            placeholder="Search..."
            className="pl-10 pr-4 py-2 border rounded-lg w-64 focus:outline-none focus:border-blue-500"
          />
          <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
        </div>
        
        <button className="relative p-2 hover:bg-gray-100 rounded-full">
          <Bell className="h-6 w-6" />
          <span className="absolute top-0 right-0 h-3 w-3 bg-red-500 rounded-full"></span>
        </button>
        
        <div className="flex items-center space-x-2">
          <span>28 Jan, 2021 - 28 Dec, 2021</span>
        </div>
      </div>
    </div>
  )
}

