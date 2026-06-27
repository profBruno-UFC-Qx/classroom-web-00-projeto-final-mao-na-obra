"use strict";

async function ensurePublicPermissions(strapi) {
  const permissionModel = strapi.db?.query?.(
    "plugin::users-permissions.permission",
  );
  const roleModel = strapi.db?.query?.("plugin::users-permissions.role");

  if (!permissionModel || !roleModel) {
    return;
  }

  const publicActions = [
    "api::categoria-servico.categoria-servico.find",
    "api::categoria-servico.categoria-servico.findOne",
    "api::perfil.perfil.find",
    "api::perfil.perfil.findOne",
    "api::servico.servico.find",
    "api::servico.servico.findOne",
    "api::solicitacao.solicitacao.find",
    "api::solicitacao.solicitacao.findOne",
  ];

  const authenticatedActions = [
    ...publicActions,
    "api::categoria-servico.categoria-servico.create",
    "api::categoria-servico.categoria-servico.update",
    "api::perfil.perfil.create",
    "api::perfil.perfil.update",
    "api::servico.servico.create",
    "api::servico.servico.update",
    "api::solicitacao.solicitacao.create",
    "api::solicitacao.solicitacao.update",
  ];

  const roleMap = {
    public: publicActions,
    authenticated: authenticatedActions,
  };

  for (const [roleType, actions] of Object.entries(roleMap)) {
    const role = await roleModel.findOne({ where: { type: roleType } });

    if (!role) {
      continue;
    }

    for (const action of actions) {
      const existingPermission = await permissionModel.findOne({
        where: { action, role: role.id },
      });

      if (!existingPermission) {
        await permissionModel.create({
          data: { action, role: role.id },
        });
      }
    }
  }
}

async function seedHomeContent(strapi) {
  const categoriaService = strapi.documents?.(
    "api::categoria-servico.categoria-servico",
  );
  const perfilService = strapi.documents?.("api::perfil.perfil");
  const servicoService = strapi.documents?.("api::servico.servico");
  const solicitacaoService = strapi.documents?.("api::solicitacao.solicitacao");

  if (
    !categoriaService ||
    !perfilService ||
    !servicoService ||
    !solicitacaoService
  ) {
    return;
  }

  const categoriasExistentes = await categoriaService.findMany({
    limit: 1,
    fields: ["documentId"],
  });

  if (!categoriasExistentes?.length) {
    await categoriaService.create({ data: { nome: "Limpeza" } });
    await categoriaService.create({ data: { nome: "Encanamento" } });
    await categoriaService.create({ data: { nome: "Eletricista" } });
  }

  const perfisExistentes = await perfilService.findMany({
    limit: 1,
    fields: ["documentId"],
  });

  let perfilPrestador1 = null;
  let perfilPrestador2 = null;

  if (!perfisExistentes?.length) {
    const perfilCliente = await perfilService.create({
      data: {
        nomeCompleto: "Maria da Silva",
        telefone: "(88) 99999-0000",
        tipoUsuario: "cliente",
        descricao: [
          {
            type: "paragraph",
            children: [{ text: "Cliente em busca de serviços confiáveis." }],
          },
        ],
      },
    });

    perfilPrestador1 = await perfilService.create({
      data: {
        nomeCompleto: "Ana Paula Martins",
        telefone: "(88) 99999-1111",
        tipoUsuario: "prestador",
        descricao: [
          {
            type: "paragraph",
            children: [{ text: "Especialista em limpeza e organização." }],
          },
        ],
      },
    });

    perfilPrestador2 = await perfilService.create({
      data: {
        nomeCompleto: "João Mendes",
        telefone: "(88) 98888-2222",
        tipoUsuario: "prestador",
        descricao: [
          {
            type: "paragraph",
            children: [{ text: "Atende reparos hidráulicos e manutenção." }],
          },
        ],
      },
    });

    if (perfilCliente?.documentId) {
      await solicitacaoService.create({
        data: {
          mensagem: "Preciso de um serviço de limpeza para hoje.",
          endereco: "Rua das Flores, 123",
          dataDesejada: "2026-07-01",
          statusSolicitacao: "PENDENTE",
          cliente: perfilCliente.documentId,
          prestador: perfilPrestador1.documentId,
        },
      });
    }
  } else {
    const perfis = await perfilService.findMany({
      limit: 10,
      fields: ["documentId", "nomeCompleto", "tipoUsuario"],
    });
    perfilPrestador1 =
      perfis.find((perfil) => perfil?.nomeCompleto?.includes("Ana Paula")) ||
      perfis[0];
    perfilPrestador2 =
      perfis.find((perfil) => perfil?.nomeCompleto?.includes("João")) ||
      perfis[1];
  }

  const servicosExistentes = await servicoService.findMany({
    limit: 1,
    fields: ["documentId"],
  });

  if (!servicosExistentes?.length && perfilPrestador1 && perfilPrestador2) {
    await servicoService.create({
      data: {
        titulo: "Limpeza residencial",
        preco: 120,
        categoria: "Limpeza",
        ativo: true,
        prestador: perfilPrestador1.documentId,
      },
    });

    await servicoService.create({
      data: {
        titulo: "Reparo de encanamento",
        preco: 180,
        categoria: "Encanamento",
        ativo: true,
        prestador: perfilPrestador2.documentId,
      },
    });
  }

  const solicitacoesExistentes = await solicitacaoService.findMany({
    limit: 1,
    fields: ["documentId"],
  });

  if (!solicitacoesExistentes?.length && perfilPrestador1 && perfilPrestador2) {
    await solicitacaoService.create({
      data: {
        mensagem: "Gostaria de solicitar uma limpeza na casa.",
        endereco: "Rua das Flores, 123",
        dataDesejada: "2026-07-01",
        statusSolicitacao: "PENDENTE",
        cliente: perfilPrestador1.documentId,
        prestador: perfilPrestador2.documentId,
      },
    });
  }
}

module.exports = {
  register(/*{ strapi }*/) {},

  async bootstrap({ strapi }) {
    await ensurePublicPermissions(strapi);
    await seedHomeContent(strapi);
  },
};
