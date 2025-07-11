import React, { useMemo } from "react";

export default function PremiumCountdown({ deletionTimestamp }) {
  const daysRemaining = useMemo(() => {
    if (!deletionTimestamp) return null;

    const now = new Date();
    const diffMs = new Date(deletionTimestamp).getTime() - now.getTime();
    const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    return days >= 0 ? days : 0;
  }, [deletionTimestamp]);

  if (daysRemaining === null) return null;

  return (
    <div className="bg-red-100 text-red-700 p-2 rounded mt-3 text-sm">
      ⚠️ Tu backup cloud se borrará en {daysRemaining} día
      {daysRemaining !== 1 ? "s" : ""}.
    </div>
  );
}
