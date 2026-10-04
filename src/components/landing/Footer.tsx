import { motion } from "framer-motion";
import { BrandLogo } from "@/components/BrandLogo";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    Produto: [
      { label: "Recursos", href: "#features" },
      { label: "Como Funciona", href: "#how-it-works" },
      { label: "Rankings", href: "#rankings" },
      { label: "Preços", href: "#pricing" },
    ],
    Suporte: [
      { label: "Central de Ajuda", href: "#" },
      { label: "FAQ", href: "#" },
      { label: "Contato", href: "#contact" },
      { label: "Comunidade", href: "#" },
    ],
    Legal: [
      { label: "Termos de Uso", href: "#" },
      { label: "Privacidade", href: "#" },
      { label: "Cookies", href: "#" },
    ],
  };

  return (
    <footer id="contact" className="bg-card border-t border-border">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand Column */}
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <img
                src={logoAsset.url}
                alt="StudyFlow"
                className="h-32 w-auto max-w-full object-contain mb-4"
              />
              <p className="text-muted-foreground max-w-sm mb-6">
                O ponto de partida para alavancar seus estudos. Inteligência
                artificial, gamificação e organização em uma única plataforma.
              </p>
              <div className="flex items-center gap-4">
                {/* Social Links Placeholder */}
                {["twitter", "instagram", "youtube", "discord"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-primary/10 transition-colors"
                    >
                      <span className="sr-only">{social}</span>
                      <svg
                        className="w-5 h-5"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <circle cx="12" cy="12" r="10" opacity="0.2" />
                      </svg>
                    </a>
                  )
                )}
              </div>
            </motion.div>
          </div>

          {/* Links Columns */}
          {Object.entries(footerLinks).map(([title, links], index) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1, duration: 0.5 }}
            >
              <h4 className="font-semibold mb-4">{title}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <a
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-16 pt-8 border-t border-border flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} StudyFlow. Todos os direitos reservados.
          </p>
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Created by</span>
            <span className="font-semibold text-foreground">
              Eclipse Productions
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
