import {
  AbilityBuilder,
  createMongoAbility,
  MongoAbility,
} from "@casl/ability";


export type Actions = "manage" | "create" | "read" | "update" | "delete";
export type Subjects =
  | "all"
  | "Institution"
  | "User"
  | "Classroom"
  | "Activity"
  | "Invite";

export type AppAbility = MongoAbility<[Actions, Subjects]>;

export interface DefineAbilityContext {
  role: "admin" | "institution_user" | "teacher" | "student";
  institutionRole?: "admin" | "secretary" | "finance"; // ou string se quiser mais flex
  isLinkedToInstitution?: boolean;
  canCreateMoreClassrooms?: boolean;
}

export function defineAbilityFor(context: DefineAbilityContext): AppAbility {
  const {
    role,
    institutionRole,
    isLinkedToInstitution = false,
    canCreateMoreClassrooms = false,
  } = context;
  const { can, cannot, build } = new AbilityBuilder<AppAbility>(
    createMongoAbility
  );

  switch (role) {
    case "admin":
      can("manage", "all");
      break;

    case "institution_user":
      switch (institutionRole) {
        case "admin":
          can("manage", "Institution");
          can("create", "Classroom");
          can("read", "Classroom");
          can("manage", "User");
          break;
        case "secretary":
          can("read", "Classroom");
          can("read", "User");
          break;
        case "finance":
          can("read", "Institution");
          break;
        default:
          cannot("manage", "all");
      }
      break;

    case "teacher":
      can("read", "Classroom");
      can("read", "Activity");
      can("create", "Activity");

      if (isLinkedToInstitution) {
        can("create", "Classroom");
      } else if (canCreateMoreClassrooms) {
        can("create", "Classroom");
      } else {
        cannot("create", "Classroom");
      }

      break;

    case "student":
      can("read", "Classroom");
      can("read", "Activity");
      break;

    default:
      cannot("manage", "all");
  }

  return build();
}