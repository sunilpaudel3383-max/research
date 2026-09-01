import { Link } from 'react-router-dom';
import { BookOpen, Users, Beaker, ChevronRight } from 'lucide-react';

export function Landing() {
  return (
    <div className="min-h-screen bg-[#F1F5F9] font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-sm flex items-center justify-center text-white font-bold text-lg"><Beaker className="w-5 h-5"/></div>
            <h1 className="text-lg font-bold tracking-tight text-slate-900 uppercase">Nexus Research</h1>
          </div>
          <Link
            to="/login"
            className="inline-flex items-center justify-center rounded-sm bg-slate-900 px-5 py-2.5 text-[10px] font-bold uppercase tracking-widest text-white shadow-sm hover:bg-slate-800 transition-colors"
          >
            Member Login
          </Link>
        </div>
      </header>

      <main className="flex-1">
        <div className="relative isolate px-6 pt-14 lg:px-8 bg-slate-900 border-b border-slate-800">
          <div className="mx-auto max-w-2xl py-24 sm:py-32 lg:py-40 text-center">
            <h1 className="text-4xl font-bold tracking-tighter text-white sm:text-6xl uppercase">
              Advancing Science Through Collaboration
            </h1>
            <p className="mt-6 text-sm leading-8 text-slate-300 max-w-xl mx-auto">
              Welcome to the Nexus Research portal. We are dedicated to pioneering breakthroughs in cognitive neuroscience and applied artificial intelligence. Our teams work globally to publish high-impact findings.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <a href="#about" className="text-[10px] font-bold uppercase tracking-widest leading-6 text-indigo-400 hover:text-indigo-300">
                Learn more <span aria-hidden="true">&rarr;</span>
              </a>
            </div>
          </div>
        </div>

        <div id="about" className="bg-[#F1F5F9] py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-[10px] font-bold uppercase tracking-widest leading-7 text-indigo-600">Our Focus</h2>
              <p className="mt-2 text-2xl font-bold tracking-tighter text-slate-900 sm:text-3xl uppercase">
                Research Areas & Information
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-8 lg:max-w-none lg:grid-cols-3">
                <div className="flex flex-col bg-white p-8 border border-slate-200 rounded-sm hover:shadow-sm transition-all">
                  <dt className="flex items-center gap-x-3 text-xs font-bold uppercase tracking-tighter leading-7 text-slate-900">
                    <BookOpen className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    Publications
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-slate-500">
                    <p className="flex-auto">
                      Our researchers consistently publish in top-tier journals. We maintain an open repository of our latest manuscripts and peer-reviewed literature.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col bg-white p-8 border border-slate-200 rounded-sm hover:shadow-sm transition-all">
                  <dt className="flex items-center gap-x-3 text-xs font-bold uppercase tracking-tighter leading-7 text-slate-900">
                    <Users className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    Active Groups
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-slate-500">
                    <p className="flex-auto">
                      Members collaborate in dedicated research groups with real-time manuscript editing tools, literature sharing, and integrated storage.
                    </p>
                  </dd>
                </div>
                <div className="flex flex-col bg-white p-8 border border-slate-200 rounded-sm hover:shadow-sm transition-all">
                  <dt className="flex items-center gap-x-3 text-xs font-bold uppercase tracking-tighter leading-7 text-slate-900">
                    <Beaker className="h-5 w-5 flex-none text-indigo-600" aria-hidden="true" />
                    Facilities
                  </dt>
                  <dd className="mt-4 flex flex-auto flex-col text-sm leading-7 text-slate-500">
                    <p className="flex-auto">
                      Equipped with state-of-the-art computational clusters, we push the boundaries of data analysis and simulation.
                    </p>
                  </dd>
                </div>
              </dl>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
