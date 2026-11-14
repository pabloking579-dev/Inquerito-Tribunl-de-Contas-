const { pool } = require('../config/database');

const seeder = async () => {
  let connection;
  
  try {
    connection = await pool.getConnection();
    console.log('🔗 Conexão estabelecida para SEEDER...\n');

    // Desativar constraints temporariamente
    await connection.query('SET FOREIGN_KEY_CHECKS = 0');

    // Limpar tabelas na ordem correta
    console.log('🧹 Limpando tabelas existentes...');
    
    const tablesToClear = [
      'respostas_detalhe',
      'respostas_master',
      'perguntas_opcoes',
      'perguntas',
      'questionarios',
      'usuarios',
      'departamentos',
      'empresas'
    ];

    for (const table of tablesToClear) {
      await connection.query(`TRUNCATE TABLE ${table}`);
      console.log(`   ✓ Tabela ${table} limpa`);
    }

    // Reativar constraints
    await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('\n✅ Tabelas limpas com sucesso!\n');

    // ============================================
    // 1. INSERIR EMPRESA
    // ============================================
    console.log('📦 Inserindo dados de teste...\n');
    
    const [empresaResult] = await connection.query(
      `INSERT INTO empresas (nome, cnpj, endereco, telefone, email, data_criacao) 
       VALUES (?, ?, ?, ?, ?, NOW())`,
      ['Tech Solutions Ltda', '12.345.678/0001-90', 'Rua das Flores, 123 - São Tomé', '+239 222 1234', 'contato@techsolutions.stp']
    );
    const empresa_id = empresaResult.insertId;
    console.log(`   ✓ Empresa criada (ID: ${empresa_id})`);

    // ============================================
    // 2. INSERIR DEPARTAMENTOS
    // ============================================
    const [depto1] = await connection.query(
      `INSERT INTO departamentos (empresa_id, nome, descricao, responsavel) 
       VALUES (?, ?, ?, ?)`,
      [empresa_id, 'Recursos Humanos', 'Gestão de pessoal e clima organizacional', 'Ana Silva']
    );
    const depto1_id = depto1.insertId;
    console.log(`   ✓ Departamento RH criado (ID: ${depto1_id})`);

    const [depto2] = await connection.query(
      `INSERT INTO departamentos (empresa_id, nome, descricao, responsavel) 
       VALUES (?, ?, ?, ?)`,
      [empresa_id, 'Tecnologia', 'Desenvolvimento e infraestrutura', 'Carlos Santos']
    );
    const depto2_id = depto2.insertId;
    console.log(`   ✓ Departamento TI criado (ID: ${depto2_id})`);

    // ============================================
    // 3. INSERIR USUÁRIOS
    // ============================================
    const bcrypt = require('bcryptjs');
    
    // Hash das senhas (senha padrão: 123456)
    const hashedPassword = await bcrypt.hash('123456', 10);

    const [user1] = await connection.query(
      `INSERT INTO usuarios (empresa_id, departamento_id, nome, email, senha, cargo, tipo, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, depto1_id, 'Admin Sistema', 'admin@techsolutions.stp', hashedPassword, 'Administrador', 'admin', 1]
    );
    const admin_id = user1.insertId;
    console.log(`   ✓ Usuário Admin criado (ID: ${admin_id})`);

    const [user2] = await connection.query(
      `INSERT INTO usuarios (empresa_id, departamento_id, nome, email, senha, cargo, tipo, ativo) 
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [empresa_id, depto2_id, 'João Funcionário', 'joao@techsolutions.stp', hashedPassword, 'Desenvolvedor', 'funcionario', 1]
    );
    const funcionario_id = user2.insertId;
    console.log(`   ✓ Usuário Funcionário criado (ID: ${funcionario_id})`);

    // ============================================
    // 4. INSERIR QUESTIONÁRIO
    // ============================================
    const [questionario] = await connection.query(
      `INSERT INTO questionarios (empresa_id, titulo, descricao, data_criacao, data_inicio, data_fim, ativo, publicado) 
       VALUES (?, ?, ?, NOW(), NOW(), DATE_ADD(NOW(), INTERVAL 30 DAY), ?, ?)`,
      [empresa_id, 'Avaliação de Clima Organizacional', 'Pesquisa anual para avaliar o clima e a satisfação dos colaboradores', 1, 1]
    );
    const questionario_id = questionario.insertId;
    console.log(`   ✓ Questionário criado (ID: ${questionario_id})`);

    // ============================================
    // 5. INSERIR PERGUNTAS (CORRIGIDO: obrigatoria sem acento)
    // ============================================
    
    // Pergunta 1 - TEXTO
    const [pergunta1] = await connection.query(
      `INSERT INTO perguntas (questionario_id, tipo, enunciado, obrigatoria, ordem, ativa) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [questionario_id, 'texto', 'Deixe suas sugestões para melhoria do ambiente de trabalho:', 0, 1, 1]
    );
    const pergunta1_id = pergunta1.insertId;
    console.log(`   ✓ Pergunta 1 (TEXTO) criada (ID: ${pergunta1_id})`);

    // Pergunta 2 - RADIO
    const [pergunta2] = await connection.query(
      `INSERT INTO perguntas (questionario_id, tipo, enunciado, obrigatoria, ordem, ativa) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [questionario_id, 'radio', 'Você se sente motivado a trabalhar na empresa?', 1, 2, 1]
    );
    const pergunta2_id = pergunta2.insertId;
    console.log(`   ✓ Pergunta 2 (RADIO) criada (ID: ${pergunta2_id})`);

    // Opções para Pergunta 2 (Radio)
    const opcoesRadio = [
      'Sim, sempre motivado',
      'Às vezes',
      'Raramente',
      'Não, não me sinto motivado'
    ];

    for (let i = 0; i < opcoesRadio.length; i++) {
      await connection.query(
        `INSERT INTO perguntas_opcoes (pergunta_id, texto_opcao, valor, ordem) 
         VALUES (?, ?, ?, ?)`,
        [pergunta2_id, opcoesRadio[i], i + 1, i + 1]
      );
    }
    console.log(`   ✓ ${opcoesRadio.length} opções criadas para Pergunta 2`);

    // Pergunta 3 - CHECKBOX
    const [pergunta3] = await connection.query(
      `INSERT INTO perguntas (questionario_id, tipo, enunciado, obrigatoria, ordem, ativa) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [questionario_id, 'checkbox', 'Quais ferramentas você utiliza no seu dia a dia? (Marque todas que aplicam)', 1, 3, 1]
    );
    const pergunta3_id = pergunta3.insertId;
    console.log(`   ✓ Pergunta 3 (CHECKBOX) criada (ID: ${pergunta3_id})`);

    // Opções para Pergunta 3 (Checkbox)
    const opcoesCheckbox = [
      'Computador/Desktop',
      'Notebook',
      'Smartphone',
      'Tablet',
      'Outros'
    ];

    for (let i = 0; i < opcoesCheckbox.length; i++) {
      await connection.query(
        `INSERT INTO perguntas_opcoes (pergunta_id, texto_opcao, valor, ordem) 
         VALUES (?, ?, ?, ?)`,
        [pergunta3_id, opcoesCheckbox[i], i + 1, i + 1]
      );
    }
    console.log(`   ✓ ${opcoesCheckbox.length} opções criadas para Pergunta 3`);

    // Pergunta 4 - SELECT (Bônus)
    const [pergunta4] = await connection.query(
      `INSERT INTO perguntas (questionario_id, tipo, enunciado, obrigatoria, ordem, ativa) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [questionario_id, 'select', 'Como você avalia a comunicação entre departamentos?', 1, 4, 1]
    );
    const pergunta4_id = pergunta4.insertId;
    console.log(`   ✓ Pergunta 4 (SELECT) criada (ID: ${pergunta4_id})`);

    // Opções para Pergunta 4 (Select)
    const opcoesSelect = [
      'Excelente',
      'Boa',
      'Regular',
      'Ruim',
      'Péssima'
    ];

    for (let i = 0; i < opcoesSelect.length; i++) {
      await connection.query(
        `INSERT INTO perguntas_opcoes (pergunta_id, texto_opcao, valor, ordem) 
         VALUES (?, ?, ?, ?)`,
        [pergunta4_id, opcoesSelect[i], i + 1, i + 1]
      );
    }
    console.log(`   ✓ ${opcoesSelect.length} opções criadas para Pergunta 4`);

    // ============================================
    // RESUMO
    // ============================================
    console.log('\n' + '='.repeat(60));
    console.log('🎉 SEEDER CONCLUÍDO COM SUCESSO!');
    console.log('='.repeat(60));
    console.log('\n📊 RESUMO DOS DADOS INSERIDOS:');
    console.log(`   • 1 Empresa (ID: ${empresa_id})`);
    console.log(`   • 2 Departamentos (IDs: ${depto1_id}, ${depto2_id})`);
    console.log(`   • 2 Usuários (Admin: ${admin_id}, Funcionário: ${funcionario_id})`);
    console.log(`   • 1 Questionário (ID: ${questionario_id})`);
    console.log(`   • 4 Perguntas (IDs: ${pergunta1_id}, ${pergunta2_id}, ${pergunta3_id}, ${pergunta4_id})`);
    console.log(`   • 13 Opções de Resposta`);
    console.log('\n🔐 CREDENCIAIS DE TESTE:');
    console.log('   • Email: admin@techsolutions.stp | Senha: 123456');
    console.log('   • Email: joao@techsolutions.stp | Senha: 123456');
    console.log('\n✅ Agora você pode testar a API!\n');

  } catch (error) {
    console.error('\n❌ ERRO NO SEEDER:', error.message);
    console.error('Stack:', error.stack);
    
    if (connection) {
      await connection.query('SET FOREIGN_KEY_CHECKS = 1');
    }
    process.exit(1);
  } finally {
    if (connection) {
      connection.release();
    }
    process.exit(0);
  }
};

seeder();