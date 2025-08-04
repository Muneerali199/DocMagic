import Link from "next/link";
import { FaGithub, FaLinkedin } from "react-icons/fa";

export default function Footer() {
  return (
    <footer className="bg-[#fdf3ed] dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 py-6 mt-10 text-center">
      <div className="max-w-4xl mx-auto px-4 text-sm font-medium text-gray-800 dark:text-gray-200 space-y-3">

        {/* Top row: Navigation Links + Social Icons */}
        <div className="flex flex-wrap justify-center items-center gap-3 sm:gap-5">
          <Link
            href="https://github.com/Muneerali199/DocMagic/tree/main/docs"
            className="hover:text-blue-600 dark:hover:text-white flex items-center"
          >
            Docs
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="https://github.com/Muneerali199/DocMagic/issues"
            className="hover:text-blue-600 dark:hover:text-white flex items-center"
          >
             Issues
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="https://github.com/Muneerali199/DocMagic/graphs/contributors"
            className="hover:text-blue-600 dark:hover:text-white flex items-center"
          >
             Contributions
          </Link>
          <span className="hidden sm:inline">•</span>
          <Link
            href="https://github.com/Muneerali199/DocMagic/discussions"
            className="hover:text-blue-600 dark:hover:text-white flex items-center"
          >
             Community
          </Link>

          {/* GitHub Icon */}
          <Link
            href="https://github.com/Muneerali199/DocMagic"
            className="hover:text-blue-600 dark:hover:text-white ml-3"
            aria-label="GitHub"
          >
            <FaGithub size={18} />
          </Link>

          {/* LinkedIn Icon */}
          <Link
            href="https://www.linkedin.com/in/muneer-ali/"
            className="hover:text-blue-600 dark:hover:text-white"
            aria-label="LinkedIn"
          >
            <FaLinkedin size={18} />
          </Link>
        </div>

        {/* Bottom row: Copyright + License */}
        <div className="flex flex-wrap justify-center items-center gap-2 text-sm text-gray-800 dark:text-gray-200">
          <span>© {new Date().getFullYear()} DocMagic.</span>
          <span>|</span>
          <Link
            href="https://github.com/Muneerali199/DocMagic/blob/main/LICENSE"
            className="underline hover:text-blue-600 dark:hover:text-white"
          >
            MIT License
          </Link>
        </div>
      </div>
    </footer>
  );
}
