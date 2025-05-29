import Layout from '../components/Layout';
import Link from 'next/link';

export default function Home() {
  return (
    <Layout>
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">
          Newspaper Management System
        </h1>
        <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto">
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Setup Dashboard</h2>
            <p className="text-gray-600 mb-4">
              Configure newspapers and rates for each month
            </p>
            <Link href="/setup" className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Go to Setup
            </Link>
          </div>
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Daily Records</h2>
            <p className="text-gray-600 mb-4">
              Track daily newspaper deliveries and generate reports
            </p>
            <Link href="/daily" className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600">
              Go to Daily Records
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}