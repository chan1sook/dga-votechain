export function getDefaultInternalTopicFilter(): InternalTopicVisiblityFilter {
  return {
    ministry: "",
    withDepartment: false,
    department: "",
  };
}

export const topicTypes: TopicType[] = ["public", "private"];

export function getDefaultChoices(): ChoicesInfo {
  return {
    choices: [],
    customable: false,
  };
}

export function getPresetChoices(name: string) {
  switch (name) {
    case "yesno":
      return {
        choices: [
          { name: `app.topic.template.${name}.choice1` },
          { name: `app.topic.template.${name}.choice2` },
        ],
        customable: false,
      };
    case "option2":
      return {
        choices: [
          { name: `app.topic.template.${name}.choice1` },
          { name: `app.topic.template.${name}.choice2` },
        ],
        customable: false,
      };
    case "option3":
      return {
        choices: [
          { name: `app.topic.template.${name}.choice1` },
          { name: `app.topic.template.${name}.choice2` },
          { name: `app.topic.template.${name}.choice3` },
        ],
        customable: false,
      };
    default:
      return getDefaultChoices();
  }
}

export function getPresetTemplate(name: string): Partial<TopicFormData> {
  switch (name) {
    case "yesno":
      return {
        name: `app.topic.template.${name}.label`,
        choices: getPresetChoices(name),
      };
    case "option2":
      return {
        name: `app.topic.template.${name}.label`,
        choices: getPresetChoices(name),
      };
    case "option3":
      return {
        name: `app.topic.template.${name}.label`,
        choices: getPresetChoices(name),
      };
    default:
      return {
        name: "",
        choices: getDefaultChoices(),
      };
  }
}
