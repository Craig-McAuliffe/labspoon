export default function types() {
  return [
    {
      id: 'post',
      name: 'post'
    },
    {
      id: 'person',
      name: 'person'
    },
  ];
};

export function getTypesFilterOptions() {
  const options = types().map((type) => ({
    enabled: false,
    data: type,
  }));
  return {
    collectionName: 'Types',
    options: options,
    mutable: false,
  };
}
