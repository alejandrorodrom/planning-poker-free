<footer class="container-footer">
  <section class="footer">
    <p class="footer__left">
      <span class="footer__left-code" aria-hidden="true">&lt;/&gt;</span>
      Desarrollado por
      <a
        class="footer__left-author"
        href="https://www.linkedin.com/in/alejandro-rodriguez-romero"
        target="_blank"
        rel="noopener noreferrer"
      >
        Alejandro Rodriguez Romero
      </a>
    </p>
    <div class="footer__right">
      <a
        class="footer__right-link"
        href="https://github.com/alejandrorodrom/planning-poker-free"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="GitHub"
      >
        GitHub
      </a>
      <a
        class="footer__right-link footer__right-link--sponsor"
        href="https://github.com/sponsors/alejandrorodrom"
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Patrocinar en GitHub Sponsors"
      >
        <svg
          class="footer__sponsor-icon"
          viewBox="0 0 16 16"
          width="16"
          height="16"
          aria-hidden="true"
        >
          <path
            fill="currentColor"
            d="M8 14.25l-.345-.666C4.53 8.988 2.5 7.01 2.5 4.75A3.25 3.25 0 0 1 5.75 1.5c1.05 0 2.03.49 2.65 1.29A3.24 3.24 0 0 1 11.05 1.5 3.25 3.25 0 0 1 14.3 4.75c0 2.26-2.03 4.238-5.155 8.834L8 14.25z"
          />
        </svg>
        Sponsor
      </a>
    </div>
  </section>
</footer>

<style>
  .container-footer {
    display: block;
    width: 100%;
    user-select: none;
  }

  .footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: 12px;
    margin: 15px;
    padding: 0 15px;
    font-size: 15px;
    font-family: var(--font-body);
    flex-wrap: wrap;
  }

  .footer__left {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    margin: 0;
    gap: 5px;
  }

  .footer__left-code {
    margin-right: 5px;
    font-weight: 600;
    color: var(--color-brand);
  }

  .footer__left-author {
    color: black;
    font-weight: 600;
    text-decoration: none;
  }

  .footer__left-author:hover {
    text-decoration: underline;
  }

  .footer__right {
    display: flex;
    align-items: center;
    gap: 14px;
  }

  .footer__right-link {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    color: black;
    text-decoration: none;
    font-weight: 600;
  }

  .footer__right-link:hover {
    color: var(--color-brand);
  }

  .footer__right-link--sponsor:hover {
    color: #bf3989;
  }

  .footer__sponsor-icon {
    flex-shrink: 0;
  }
</style>
