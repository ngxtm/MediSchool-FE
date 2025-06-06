const NoRole = () => {
    return (
        <div className="flex flex-col items-center justify-center h-screen bg-gray-100">
            <h1 className="text-4xl font-bold text-gray-800 mb-4">No Role Assigned</h1>
            <p className="text-lg text-gray-600">You do not have a role assigned to your account.</p>
            <p className="text-lg text-gray-600">Please contact your administrator for assistance.</p>
            <a href="/login" className="mt-4 text-blue-600 hover:underline">
            Go to login
            </a>
        </div >
    );
}

export default NoRole;