export default async function SettingsPage() {

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-500 mt-1">Manage platform settings</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <nav className="lg:col-span-1 space-y-1">
          <button className="w-full text-left px-4 py-2 bg-gray-100 text-gray-900 font-medium rounded-lg">
            General
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Users
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Integrations
          </button>
          <button className="w-full text-left px-4 py-2 text-gray-600 hover:bg-gray-50 rounded-lg">
            Branding
          </button>
        </nav>

        <div className="lg:col-span-3 bg-white rounded-xl border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            General Settings
          </h2>

          <div className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Name
              </label>
              <input
                type="text"
                defaultValue="TeamLMTD"
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Timezone
              </label>
              <select className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]">
                <option value="Asia/Dubai">Asia/Dubai (GMT+4)</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Default Weekly Capacity
              </label>
              <input
                type="number"
                defaultValue={40}
                className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#52EDC7]"
              />
            </div>

            <div className="pt-4 border-t border-gray-200">
              <button className="px-4 py-2 bg-[#52EDC7] text-gray-900 font-medium rounded-lg hover:bg-[#1BA098] hover:text-white transition-colors">
                Save Changes
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
