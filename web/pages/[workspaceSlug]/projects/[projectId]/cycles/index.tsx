import { Fragment, useCallback, useState, ReactElement } from "react";
import { useRouter } from "next/router";
import { observer } from "mobx-react-lite";
import { Tab } from "@headlessui/react";
import { Plus } from "lucide-react";
// hooks
import { useCycle, useUser } from "hooks/store";
import useLocalStorage from "hooks/use-local-storage";
// layouts
import { AppLayout } from "layouts/app-layout";
// components
import { CyclesHeader } from "components/headers";
import { CyclesView, ActiveCycleDetails, CycleCreateUpdateModal } from "components/cycles";
import { NewEmptyState } from "components/common/new-empty-state";
// ui
import { Tooltip } from "@plane/ui";
// images
import emptyCycle from "public/empty-state/empty_cycles.webp";
// types
import { TCycleView, TCycleLayout } from "@plane/types";
import { NextPageWithLayout } from "lib/types";
// constants
import { CYCLE_TAB_LIST, CYCLE_VIEW_LAYOUTS } from "constants/cycle";
import { EUserWorkspaceRoles } from "constants/workspace";

const ProjectCyclesPage: NextPageWithLayout = observer(() => {
  const [createModal, setCreateModal] = useState(false);
  // store hooks
  const {
    membership: { currentProjectRole },
  } = useUser();
  const { currentProjectCycleIds } = useCycle();
  // router
  const router = useRouter();
  const { workspaceSlug, projectId, peekCycle } = router.query;
  // local storage
  const { storedValue: cycleTab, setValue: setCycleTab } = useLocalStorage<TCycleView>("cycle_tab", "active");
  const { storedValue: cycleLayout, setValue: setCycleLayout } = useLocalStorage<TCycleLayout>("cycle_layout", "list");

  const handleCurrentLayout = useCallback(
    (_layout: TCycleLayout) => {
      setCycleLayout(_layout);
    },
    [setCycleLayout]
  );

  const handleCurrentView = useCallback(
    (_view: TCycleView) => {
      setCycleTab(_view);
      if (_view === "draft") handleCurrentLayout("list");
    },
    [handleCurrentLayout, setCycleTab]
  );

  const totalCycles = currentProjectCycleIds?.length ?? 0;

  const isEditingAllowed = !!currentProjectRole && currentProjectRole >= EUserWorkspaceRoles.MEMBER;

  if (!workspaceSlug || !projectId) return null;

  return (
    <div className="w-full h-full">
      <CycleCreateUpdateModal
        workspaceSlug={workspaceSlug.toString()}
        projectId={projectId.toString()}
        isOpen={createModal}
        handleClose={() => setCreateModal(false)}
      />
      {totalCycles === 0 ? (
        <div className="h-full place-items-center">
          <NewEmptyState
            title="Group and timebox your work in Cycles."
            description="Break work down by timeboxed chunks, work backwards from your project deadline to set dates, and make tangible progress as a team."
            image={emptyCycle}
            comicBox={{
              title: "Cycles are repetitive time-boxes.",
              direction: "right",
              description:
                "A sprint, an iteration, and or any other term you use for weekly or fortnightly tracking of work is a cycle.",
            }}
            primaryButton={{
              icon: <Plus className="h-4 w-4" />,
              text: "Set your first cycle",
              onClick: () => {
                setCreateModal(true);
              },
            }}
            disabled={!isEditingAllowed}
          />
        </div>
      ) : (
        <Tab.Group
          as="div"
          className="flex h-full flex-col overflow-hidden"
          defaultIndex={CYCLE_TAB_LIST.findIndex((i) => i.key == cycleTab)}
          selectedIndex={CYCLE_TAB_LIST.findIndex((i) => i.key == cycleTab)}
          onChange={(i) => handleCurrentView(CYCLE_TAB_LIST[i]?.key ?? "active")}
        >
          <div className="flex flex-col items-end justify-between gap-4 border-b border-custom-border-200 px-4 pb-4 sm:flex-row sm:items-center sm:px-5 sm:pb-0">
            <Tab.List as="div" className="flex items-center overflow-x-scroll">
              {CYCLE_TAB_LIST.map((tab) => (
                <Tab
                  key={tab.key}
                  className={({ selected }) =>
                    `border-b-2 p-4 text-sm font-medium outline-none ${
                      selected ? "border-custom-primary-100 text-custom-primary-100" : "border-transparent"
                    }`
                  }
                >
                  {tab.name}
                </Tab>
              ))}
            </Tab.List>
            {cycleTab !== "active" && (
              <div className="flex items-center gap-1 rounded bg-custom-background-80 p-1">
                {CYCLE_VIEW_LAYOUTS.map((layout) => {
                  if (layout.key === "gantt" && cycleTab === "draft") return null;

                  return (
                    <Tooltip key={layout.key} tooltipContent={layout.title}>
                      <button
                        type="button"
                        className={`group grid h-[22px] w-7 place-items-center overflow-hidden rounded transition-all hover:bg-custom-background-100 ${
                          cycleLayout == layout.key ? "bg-custom-background-100 shadow-custom-shadow-2xs" : ""
                        }`}
                        onClick={() => handleCurrentLayout(layout.key as TCycleLayout)}
                      >
                        <layout.icon
                          strokeWidth={2}
                          className={`h-3.5 w-3.5 ${
                            cycleLayout == layout.key ? "text-custom-text-100" : "text-custom-text-200"
                          }`}
                        />
                      </button>
                    </Tooltip>
                  );
                })}
              </div>
            )}
          </div>

          <Tab.Panels as={Fragment}>
            <Tab.Panel as="div" className="h-full overflow-y-auto">
              {cycleTab && cycleLayout && (
                <CyclesView
                  filter="all"
                  layout={cycleLayout}
                  workspaceSlug={workspaceSlug.toString()}
                  projectId={projectId.toString()}
                  peekCycle={peekCycle?.toString()}
                />
              )}
            </Tab.Panel>

            <Tab.Panel as="div" className="h-full space-y-5 overflow-y-auto p-4 sm:p-5">
              <ActiveCycleDetails workspaceSlug={workspaceSlug.toString()} projectId={projectId.toString()} />
            </Tab.Panel>

            <Tab.Panel as="div" className="h-full overflow-y-auto">
              {cycleTab && cycleLayout && (
                <CyclesView
                  filter="upcoming"
                  layout={cycleLayout as TCycleLayout}
                  workspaceSlug={workspaceSlug.toString()}
                  projectId={projectId.toString()}
                  peekCycle={peekCycle?.toString()}
                />
              )}
            </Tab.Panel>

            <Tab.Panel as="div" className="h-full overflow-y-auto">
              {cycleTab && cycleLayout && workspaceSlug && projectId && (
                <CyclesView
                  filter="completed"
                  layout={cycleLayout as TCycleLayout}
                  workspaceSlug={workspaceSlug.toString()}
                  projectId={projectId.toString()}
                  peekCycle={peekCycle?.toString()}
                />
              )}
            </Tab.Panel>

            <Tab.Panel as="div" className="h-full overflow-y-auto">
              {cycleTab && cycleLayout && workspaceSlug && projectId && (
                <CyclesView
                  filter="draft"
                  layout={cycleLayout as TCycleLayout}
                  workspaceSlug={workspaceSlug.toString()}
                  projectId={projectId.toString()}
                  peekCycle={peekCycle?.toString()}
                />
              )}
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      )}
    </div>
  );
});

ProjectCyclesPage.getLayout = function getLayout(page: ReactElement) {
  return (
    <AppLayout header={<CyclesHeader />} withProjectWrapper>
      {page}
    </AppLayout>
  );
};

export default ProjectCyclesPage;
