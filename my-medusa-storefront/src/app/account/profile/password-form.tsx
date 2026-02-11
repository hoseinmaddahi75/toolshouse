"use client";

import { useActionState } from "react"; // React 19 Hook
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, KeyRound } from "lucide-react";
import { updatePasswordAction } from "./actions";
import { toast } from "sonner";
import { useEffect, useRef } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="outline" className="w-full md:w-auto gap-2 border-gray-300" disabled={pending}>
      {pending ? <Loader2 className="w-4 h-4 animate-spin"/> : <KeyRound className="w-4 h-4"/>}
      {pending ? "در حال تغییر..." : "تغییر رمز عبور"}
    </Button>
  );
}

const initialState = {
  success: false,
  message: "",
};

export default function PasswordForm() {
  const [state, formAction] = useActionState(updatePasswordAction, initialState);
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.message) {
      if (state.success) {
        toast.success(state.message);
        formRef.current?.reset(); // پاک کردن فرم بعد از موفقیت
      } else {
        toast.error(state.message);
      }
    }
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-4 max-w-lg">
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="new_password">رمز عبور جدید</Label>
          <Input 
            id="new_password" 
            name="new_password" 
            type="password"
            placeholder="******" 
            required
            minLength={6}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm_password">تکرار رمز عبور</Label>
          <Input 
            id="confirm_password" 
            name="confirm_password" 
            type="password"
            placeholder="******" 
            required
            minLength={6}
          />
        </div>
      </div>

      <div className="pt-2">
        <SubmitButton />
      </div>
    </form>
  );
}