import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCircle } from '../hooks/useCircle';

export function HomePage() {
  const navigate = useNavigate();
  const { create, isCreating } = useCreateCircle();

  useEffect(() => {
    async function initCircle() {
      const circle = await create();
      if (circle) {
        navigate(`/circle/${circle.editToken}`, { replace: true });
      }
    }
    initCircle();
  }, []);

  if (isCreating) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-lg">Creating your circle...</p>
      </div>
    );
  }

  return null;
}
