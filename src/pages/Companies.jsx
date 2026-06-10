import { useEffect, useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { API_BASE } from "../config";
import {
  LuSearch,
  LuBuilding2,
  LuLoaderCircle,
  LuTriangleAlert,
  LuRefreshCw,
  LuChevronRight,
  LuBriefcase,
} from "react-icons/lu";

export default function Companies() {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pageError, setPageError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    loadCompanies();
  }, []);

  async function loadCompanies() {
    setLoading(true);
    setPageError("");

    try {
      const res = await fetch(`${API_BASE}/api/users/companies`);

      let data;
      try {
        data = await res.json();
      } catch {
        data = [];
      }

      if (!res.ok) {
        setPageError(data?.message || "Failed to load companies");
        setCompanies([]);
        return;
      }

      setCompanies(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error("Failed to load companies:", err);
      setPageError("Failed to load companies");
      setCompanies([]);
    } finally {
      setLoading(false);
    }
  }

  // Get filtered companies with job counts
  const filteredCompanies = useMemo(() => {
    let companiesArray = [...companies];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      companiesArray = companiesArray.filter((company) =>
        (company.companyName || company.name || "").toLowerCase().includes(query) ||
        (company.industry || "").toLowerCase().includes(query) ||
        (company.companyCity || "").toLowerCase().includes(query)
      );
    }

    // Sort alphabetically by company name
    return companiesArray.sort((a, b) => {
      const nameA = a.companyName || a.name || "";
      const nameB = b.companyName || b.name || "";
      return nameA.localeCompare(nameB);
    });
  }, [companies, searchQuery]);

  function handleSearch(e) {
    setSearchQuery(e.target.value);
  }

  return (
    <div className="min-h-screen bg-stone-100">
      <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-black text-stone-900">Companies</h1>
          <p className="mt-2 text-stone-600">
            Browse {filteredCompanies.length} companies in our network
          </p>
        </div>

        {/* Search Bar */}
        <div className="mb-8 rounded-2xl border border-stone-200 bg-white p-4 shadow-sm">
          <div className="relative">
            <LuSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400" size={20} />
            <input
              type="text"
              placeholder="Search companies..."
              value={searchQuery}
              onChange={handleSearch}
              className="w-full border-0 bg-transparent pl-12 pr-4 py-3 text-sm outline-none placeholder:text-stone-400"
            />
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex min-h-[60vh] items-center justify-center">
            <div className="flex items-center gap-3 rounded-2xl border border-stone-200 bg-white px-5 py-4 shadow-sm">
              <LuLoaderCircle className="animate-spin text-orange-500" size={20} />
              <span className="text-sm font-semibold text-stone-700">
                Loading companies...
              </span>
            </div>
          </div>
        )}

        {/* Error */}
        {!loading && pageError && (
          <div className="rounded-3xl border border-red-200 bg-white p-8">
            <div className="flex items-start gap-3">
              <div className="rounded-2xl bg-red-50 p-3 text-red-600">
                <LuTriangleAlert size={22} />
              </div>
              <div>
                <h2 className="text-xl font-bold text-stone-900">Unable to load companies</h2>
                <p className="mt-2 text-sm text-stone-600">{pageError}</p>
                <button
                  onClick={loadCompanies}
                  className="mt-4 flex items-center gap-2 rounded-xl bg-orange-500 px-4 py-2 text-sm font-bold text-white hover:bg-orange-600"
                >
                  <LuRefreshCw size={16} />
                  Retry
                </button>
              </div>
            </div>
          </div>
        )}

        {/* No companies found */}
        {!loading && !pageError && filteredCompanies.length === 0 && (
          <div className="rounded-3xl border border-stone-200 bg-white p-8 text-center">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-stone-100">
              <LuBuilding2 className="text-stone-400" size={28} />
            </div>
            <h2 className="text-xl font-bold text-stone-900">
              {searchQuery ? "No companies found" : "No companies registered"}
            </h2>
            <p className="mt-2 text-stone-600">
              {searchQuery
                ? "Try adjusting your search terms"
                : "No companies have registered yet"}
            </p>
          </div>
        )}

        {/* Companies Grid */}
        {!loading && !pageError && filteredCompanies.length > 0 && (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filteredCompanies.map((company) => (
              <Link
                key={company._id}
                to={`/company-profile/${company._id}`}
                className="group overflow-hidden rounded-2xl border border-stone-200 bg-white transition hover:border-orange-200 hover:shadow-lg"
              >
                <div className="p-6">
                  {/* Company header */}
                  <div className="mb-4 flex items-start justify-between">
                    <div className="rounded-xl bg-gradient-to-br from-orange-400 to-orange-600 p-3 text-white">
                      <LuBuilding2 size={24} />
                    </div>
                    {company.industry && (
                      <span className="rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-bold text-orange-700">
                        {company.industry}
                      </span>
                    )}
                  </div>

                  {/* Company name */}
                  <h3 className="line-clamp-2 text-lg font-bold text-stone-900 transition group-hover:text-orange-600">
                    {company.companyName || company.name}
                  </h3>

                  {/* Company details */}
                  <div className="mt-2 space-y-1">
                    {company.companyCity && (
                      <p className="text-sm text-stone-600">
                        📍 {company.companyCity}
                      </p>
                    )}
                    {company.companySize && (
                      <p className="text-sm text-stone-600">
                        👥 {company.companySize} employees
                      </p>
                    )}
                  </div>

                  {/* Company description */}
                  {company.companyDescription && (
                    <div className="mt-4 border-t border-stone-100 pt-4">
                      <p className="line-clamp-2 text-sm text-stone-600">
                        {company.companyDescription}
                      </p>
                    </div>
                  )}

                  {/* View button */}
                  <div className="mt-4 flex items-center justify-between pt-4 opacity-0 transition group-hover:opacity-100">
                    <span className="text-xs font-semibold text-orange-600">View profile</span>
                    <LuChevronRight className="text-orange-600" size={16} />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
