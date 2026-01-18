import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCreateCircle } from '../hooks/useCircle';

export function HomePage() {
  const navigate = useNavigate();
  const { create } = useCreateCircle();

  useEffect(() => {
    const circle = create();
    navigate(`/circle/${circle.editToken}`, { replace: true });
  }, []);

  return null;
}
