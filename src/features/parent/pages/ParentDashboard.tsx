import { Outlet, Routes, Route, Navigate } from "react-router-dom";
import ParentDashboardLayout from "../../../pages/ParentDashboard/ParentDashboardLayout";
import { parentDashboardRoutes } from "../../../pages/ParentDashboard/ParentDashboardRoutes";

export default function ParentDashboard() {
  return (
    <>
      <ParentDashboardLayout>
        <Routes>
          <Route index element={<Navigate to="children" replace />} />

          {parentDashboardRoutes.flatMap((route) => {
            if (route.subItems) {
              return route.subItems.map((subItem) => (
                <Route
                  key={subItem.id}
                  path={subItem.path}
                  element={subItem.element}
                />
              ));
            }

            return route.element
              ? [
                  <Route
                    key={route.id}
                    path={route.path}
                    element={route.element}
                  />,
                ]
              : [];
          })}
        </Routes>

        <Outlet />
      </ParentDashboardLayout>
    </>
  );
}
