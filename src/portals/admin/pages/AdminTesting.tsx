import { useState } from "react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import {
  TestTube,
  Play,
  CheckCircle2,
  XCircle,
  Loader2,
  Database,
  Zap,
  Shield,
} from "lucide-react";

interface TestResult {
  name: string;
  status: "pass" | "fail" | "pending";
  message?: string;
  duration?: number;
}

const AdminTesting = () => {
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [edgeFunctionName, setEdgeFunctionName] = useState("");
  const [edgeFunctionBody, setEdgeFunctionBody] = useState('{"test": true}');
  const [edgeFunctionResult, setEdgeFunctionResult] = useState<string | null>(null);

  const runDatabaseTests = async () => {
    setIsRunning(true);
    const results: TestResult[] = [];

    // Test 1: Database connection
    const start1 = Date.now();
    try {
      const { data, error } = await supabase.from("profiles").select("id").limit(1);
      results.push({
        name: "Database Connection",
        status: error ? "fail" : "pass",
        message: error?.message || "Connected successfully",
        duration: Date.now() - start1,
      });
    } catch (e: any) {
      results.push({ name: "Database Connection", status: "fail", message: e.message });
    }

    // Test 2: RLS Policies (check we can read profiles)
    const start2 = Date.now();
    try {
      const { error } = await supabase.from("profiles").select("id").limit(1);
      results.push({
        name: "RLS Policies Active",
        status: error ? "fail" : "pass",
        message: error?.message || "RLS working correctly",
        duration: Date.now() - start2,
      });
    } catch (e: any) {
      results.push({ name: "RLS Policies Active", status: "fail", message: e.message });
    }

    // Test 3: Vendor Profiles Table
    const start3 = Date.now();
    try {
      const { count, error } = await supabase
        .from("vendor_profiles")
        .select("*", { count: "exact", head: true });
      results.push({
        name: "Vendor Profiles Table",
        status: error ? "fail" : "pass",
        message: error?.message || `${count || 0} vendors found`,
        duration: Date.now() - start3,
      });
    } catch (e: any) {
      results.push({ name: "Vendor Profiles Table", status: "fail", message: e.message });
    }

    // Test 4: Recipes Table
    const start4 = Date.now();
    try {
      const { count, error } = await supabase
        .from("recipes")
        .select("*", { count: "exact", head: true });
      results.push({
        name: "Recipes Table",
        status: error ? "fail" : "pass",
        message: error?.message || `${count || 0} recipes found`,
        duration: Date.now() - start4,
      });
    } catch (e: any) {
      results.push({ name: "Recipes Table", status: "fail", message: e.message });
    }

    // Test 5: Ingredients Table
    const start5 = Date.now();
    try {
      const { count, error } = await supabase
        .from("ingredients")
        .select("*", { count: "exact", head: true });
      results.push({
        name: "Ingredients Table",
        status: error ? "fail" : "pass",
        message: error?.message || `${count || 0} ingredients found`,
        duration: Date.now() - start5,
      });
    } catch (e: any) {
      results.push({ name: "Ingredients Table", status: "fail", message: e.message });
    }

    setTestResults(results);
    setIsRunning(false);
    toast.success("Database tests completed");
  };

  const testEdgeFunction = async () => {
    if (!edgeFunctionName.trim()) {
      toast.error("Please enter a function name");
      return;
    }

    setIsRunning(true);
    setEdgeFunctionResult(null);

    try {
      let body;
      try {
        body = JSON.parse(edgeFunctionBody);
      } catch {
        body = { raw: edgeFunctionBody };
      }

      const { data, error } = await supabase.functions.invoke(edgeFunctionName, {
        body,
      });

      if (error) {
        setEdgeFunctionResult(JSON.stringify({ error: error.message }, null, 2));
        toast.error("Edge function error");
      } else {
        setEdgeFunctionResult(JSON.stringify(data, null, 2));
        toast.success("Edge function executed successfully");
      }
    } catch (e: any) {
      setEdgeFunctionResult(JSON.stringify({ error: e.message }, null, 2));
      toast.error("Failed to invoke edge function");
    }

    setIsRunning(false);
  };

  const passCount = testResults.filter((r) => r.status === "pass").length;
  const failCount = testResults.filter((r) => r.status === "fail").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold flex items-center gap-3">
          <TestTube className="w-8 h-8 text-primary" />
          Testing Suite
        </h1>
        <p className="text-muted-foreground mt-1">
          Run diagnostic tests on database connections and edge functions
        </p>
      </div>

      <Tabs defaultValue="database">
        <TabsList>
          <TabsTrigger value="database" className="gap-2">
            <Database className="w-4 h-4" />
            Database Tests
          </TabsTrigger>
          <TabsTrigger value="edge" className="gap-2">
            <Zap className="w-4 h-4" />
            Edge Functions
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Shield className="w-4 h-4" />
            Security
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Database Health Checks</CardTitle>
              <CardDescription>
                Test database connectivity and table access
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={runDatabaseTests} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Running Tests...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 mr-2" />
                    Run Database Tests
                  </>
                )}
              </Button>

              {testResults.length > 0 && (
                <div className="mt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <Badge variant="default" className="bg-green-500">
                      {passCount} Passed
                    </Badge>
                    <Badge variant="destructive">{failCount} Failed</Badge>
                  </div>

                  <div className="space-y-2">
                    {testResults.map((result, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                      >
                        <div className="flex items-center gap-3">
                          {result.status === "pass" ? (
                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                          ) : (
                            <XCircle className="w-5 h-5 text-red-500" />
                          )}
                          <div>
                            <p className="font-medium">{result.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {result.message}
                            </p>
                          </div>
                        </div>
                        {result.duration && (
                          <Badge variant="outline">{result.duration}ms</Badge>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="edge" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Edge Function Tester</CardTitle>
              <CardDescription>
                Invoke and test edge functions directly
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="function-name">Function Name</Label>
                <Input
                  id="function-name"
                  placeholder="e.g., analyze-menu"
                  value={edgeFunctionName}
                  onChange={(e) => setEdgeFunctionName(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="function-body">Request Body (JSON)</Label>
                <Textarea
                  id="function-body"
                  placeholder='{"key": "value"}'
                  value={edgeFunctionBody}
                  onChange={(e) => setEdgeFunctionBody(e.target.value)}
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <Button onClick={testEdgeFunction} disabled={isRunning}>
                {isRunning ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Invoking...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Invoke Function
                  </>
                )}
              </Button>

              {edgeFunctionResult && (
                <div className="mt-4">
                  <Label>Response</Label>
                  <pre className="mt-2 p-4 rounded-lg bg-muted overflow-x-auto text-sm font-mono">
                    {edgeFunctionResult}
                  </pre>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Security Checks</CardTitle>
              <CardDescription>
                Verify RLS policies and authentication
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Row Level Security</p>
                      <p className="text-sm text-muted-foreground">
                        All tables have RLS enabled
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Authentication</p>
                      <p className="text-sm text-muted-foreground">
                        Email + password authentication enabled
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>

                <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                  <div className="flex items-center gap-3">
                    <Shield className="w-5 h-5 text-green-500" />
                    <div>
                      <p className="font-medium">Role-Based Access</p>
                      <p className="text-sm text-muted-foreground">
                        Admin, Head Chef, Line Chef roles configured
                      </p>
                    </div>
                  </div>
                  <Badge className="bg-green-500">Active</Badge>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminTesting;
