"use client";

import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  AlertCircle,
  TrendingUp,
  Users,
  Package,
  Settings,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";

const data = [
  { name: "Jan", value: 400 },
  { name: "Feb", value: 300 },
  { name: "Mar", value: 600 },
  { name: "Apr", value: 800 },
  { name: "May", value: 500 },
  { name: "Jun", value: 700 },
];

const pieData = [
  { name: "Wheat", value: 400 },
  { name: "Rice", value: 300 },
  { name: "Corn", value: 300 },
  { name: "Soybeans", value: 200 },
];

const COLORS = ["#4ade80", "#22c55e", "#16a34a", "#15803d"];

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-background/50 p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-7xl mx-auto space-y-6"
      >
        <Alert className="bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-900">
          <AlertCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
          <AlertDescription className="text-yellow-600 dark:text-yellow-400">
            This dashboard contains demo charts and data for demonstration
            purposes only.
          </AlertDescription>
        </Alert>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Farmers</p>
                <h3 className="text-2xl font-bold">1,234</h3>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  12% increase
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Active Projects</p>
                <h3 className="text-2xl font-bold">45</h3>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  8% increase
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Total Procurement
                </p>
                <h3 className="text-2xl font-bold">₹89.4M</h3>
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center">
                  <ArrowDownRight className="h-4 w-4 mr-1" />
                  3% decrease
                </p>
              </div>
              <Package className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Processing Batches
                </p>
                <h3 className="text-2xl font-bold">28</h3>
                <p className="text-sm text-green-600 dark:text-green-400 flex items-center">
                  <ArrowUpRight className="h-4 w-4 mr-1" />
                  5% increase
                </p>
              </div>
              <Settings className="h-8 w-8 text-green-600 dark:text-green-400" />
            </div>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">Procurement Trends</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#4ade80"
                    strokeWidth={2}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>

          <Card className="p-6 bg-card/80 backdrop-blur-sm">
            <h3 className="text-lg font-semibold mb-4">Crop Distribution</h3>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    fill="#8884d8"
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${entry.name}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </motion.div>
    </div>
  );
}
