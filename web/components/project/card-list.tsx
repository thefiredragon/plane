import { observer } from "mobx-react-lite";
// hooks
import { useApplication, useProject, useUser } from "hooks/store";
// components
import { ProjectCard } from "components/project";
import { Loader } from "@plane/ui";
// images
import emptyProject from "public/empty-state/empty_project.webp";
// icons
import { NewEmptyState } from "components/common/new-empty-state";
// constants
import { EUserWorkspaceRoles } from "constants/workspace";

export const ProjectCardList = observer(() => {
  // store hooks
  const {
    commandPalette: commandPaletteStore,
    eventTracker: { setTrackElement },
  } = useApplication();
  const {
    membership: { currentWorkspaceRole },
  } = useUser();
  const { workspaceProjectIds, searchedProjects, getProjectById } = useProject();

  const isEditingAllowed = !!currentWorkspaceRole && currentWorkspaceRole >= EUserWorkspaceRoles.MEMBER;

  if (!workspaceProjectIds)
    return (
      <Loader className="grid grid-cols-3 gap-4">
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
        <Loader.Item height="100px" />
      </Loader>
    );

  return (
    <>
      {workspaceProjectIds.length > 0 ? (
        <div className="h-full w-full overflow-y-auto p-8">
          {searchedProjects.length == 0 ? (
            <div className="mt-10 w-full text-center text-custom-text-400">No matching projects</div>
          ) : (
            <div className="grid grid-cols-1 gap-9 md:grid-cols-2 lg:grid-cols-3">
              {searchedProjects.map((projectId) => {
                const projectDetails = getProjectById(projectId);

                if (!projectDetails) return;

                return <ProjectCard key={projectDetails.id} project={projectDetails} />;
              })}
            </div>
          )}
        </div>
      ) : (
        <NewEmptyState
          image={emptyProject}
          title="Start a Project"
          description="Think of each project as the parent for goal-oriented work. Projects are where Jobs, Cycles, and Modules live and, along with your colleagues, help you achieve that goal."
          comicBox={{
            title: "Everything starts with a project in Plane",
            direction: "right",
            description: "A project could be a product’s roadmap, a marketing campaign, or launching a new car.",
          }}
          primaryButton={{
            text: "Start your first project",
            onClick: () => {
              setTrackElement("PROJECTS_EMPTY_STATE");
              commandPaletteStore.toggleCreateProjectModal(true);
            },
          }}
          disabled={!isEditingAllowed}
        />
      )}
    </>
  );
});
