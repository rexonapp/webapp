interface SearchPageProps {
    searchParams: {
      location?: string;
      type?: string;
      budget?: string;
    };
  }
  
  export default async function SearchPage({ searchParams }: SearchPageProps) {
    console.log(searchParams, "searchParams")
    const location = searchParams.location ?? "";
    const type = searchParams.type ?? "";
    const budget = searchParams.budget ?? "";
  
    return (
      <div className="p-6">
        <h1 className="text-xl font-semibold">Search Results</h1>
  
        <div className="mt-4 space-y-2 text-sm">
          <p><strong>City:</strong> {location}</p>
          <p><strong>Property Type:</strong> {type || "Any"}</p>
          <p><strong>Budget:</strong> {budget || "Any"}</p>
        </div>
      </div>
    );
  }
  