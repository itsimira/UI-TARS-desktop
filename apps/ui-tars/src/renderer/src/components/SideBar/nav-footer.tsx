import { User, LogOut } from 'lucide-react';
import { Button } from '@renderer/components/ui/button';
import { useUserStore } from '@renderer/store/user';
import { useNavigate } from 'react-router';

export function NavSettings() {
  const { user, logout } = useUserStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout().then(() => {
      navigate('/login');
    });
  };

  return (
    <div className="flex items-center gap-2 rounded-md border">
      <div className="flex items-center text-sm font-medium shrink grow px-3">
        <User className="h-4 mr-2" strokeWidth={2} />
        <span>{user?.email}</span>
      </div>

      <Button
        onClick={handleLogout}
        size="icon"
        variant="ghost"
        className="font-medium"
      >
        <LogOut strokeWidth={2} />
      </Button>
    </div>
  );
}
