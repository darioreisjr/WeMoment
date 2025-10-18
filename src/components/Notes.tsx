import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { useApp } from '../context/AppContext';
import { Note } from '../types';
import { FileText, Plus, X, Edit3, Trash2, Search } from 'lucide-react';

export default function Notes() {
  const { state, dispatch } = useApp();
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [noteForm, setNoteForm] = useState({
    title: '',
    content: '',
  });

  // Carrega as anotações da API ao montar o componente
  useEffect(() => {
    const fetchNotes = async () => {
        if (!state.auth.token) return;
        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes`, {
                headers: { 'Authorization': `Bearer ${state.auth.token}` }
            });
            if (response.ok) {
                const data = await response.json();
                dispatch({ type: 'SET_NOTES', payload: data });
            } else {
                toast.error('Falha ao carregar anotações.');
            }
        } catch (error) {
            toast.error('Erro de conexão ao buscar anotações.');
        }
    };
    fetchNotes();
  }, [state.auth.token, dispatch]);

  const filteredNotes = state.notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (note.content && note.content.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleNoteSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!state.auth.token) {
        toast.error("Sessão expirada. Faça login novamente.");
        return;
    }

    const isEditing = !!editingNote;
    const url = isEditing
      ? `${import.meta.env.VITE_API_URL}/api/notes/${editingNote.id}`
      : `${import.meta.env.VITE_API_URL}/api/notes`;
    const method = isEditing ? 'PUT' : 'POST';

    try {
        const response = await fetch(url, {
            method,
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${state.auth.token}`,
            },
            body: JSON.stringify(noteForm),
        });

        const responseData = await response.json();

        if (!response.ok) {
            throw new Error(responseData.error || 'Falha ao salvar a anotação.');
        }

        if (isEditing) {
            dispatch({ type: 'UPDATE_NOTE', payload: responseData });
            toast.success(`Anotação "${responseData.title}" atualizada! ✏️`);
        } else {
            dispatch({ type: 'ADD_NOTE', payload: responseData });
            toast.success(`Anotação "${responseData.title}" criada! 📝`);
        }

        setShowNoteModal(false);
        setEditingNote(null);
        setNoteForm({ title: '', content: '' });

    } catch (error) {
        toast.error((error as Error).message || 'Ocorreu um erro desconhecido.');
    }
  };

  const handleEditNote = (note: Note) => {
    setEditingNote(note);
    setNoteForm({
      title: note.title,
      content: note.content || '',
    });
    setShowNoteModal(true);
  };

  const handleDeleteNote = async (noteId: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta anotação?')) {
        if (!state.auth.token) return;

        try {
            const response = await fetch(`${import.meta.env.VITE_API_URL}/api/notes/${noteId}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${state.auth.token}` },
            });

            if (!response.ok) {
                throw new Error('Falha ao excluir a anotação.');
            }

            dispatch({ type: 'DELETE_NOTE', payload: noteId });
            toast.success('Anotação excluída com sucesso! 🗑️');

        } catch (error) {
            toast.error((error as Error).message);
        }
    }
  };

  const openNewNoteModal = () => {
    setEditingNote(null);
    setNoteForm({ title: '', content: '' });
    setShowNoteModal(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold bg-gradient-to-r from-rose-600 to-pink-600 bg-clip-text text-transparent">
          Anotações
        </h1>
        <button
          onClick={openNewNoteModal}
          className="flex items-center px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
        >
          <Plus className="mr-2" size={20} />
          Nova Anotação
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
            placeholder="Pesquisar anotações..."
          />
        </div>
      </div>

      {/* Notes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredNotes.length === 0 ? (
          <div className="col-span-full text-center py-16">
            <FileText className="mx-auto text-gray-300 mb-4" size={64} />
            <p className="text-gray-500 text-lg">
              {searchTerm ? 'Nenhuma anotação encontrada' : 'Nenhuma anotação ainda'}
            </p>
            <p className="text-gray-400 mt-2">
              {searchTerm ? 'Tente pesquisar com outros termos' : 'Que tal registrar uma ideia ou lembrete?'}
            </p>
          </div>
        ) : (
          filteredNotes.map((note) => (
            <div key={note.id} className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg border border-white/20 hover:shadow-xl transition-all">
              <div className="flex items-start justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 truncate">{note.title}</h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleEditNote(note)}
                    className="p-1 rounded-lg hover:bg-blue-100 transition-colors"
                  >
                    <Edit3 className="text-blue-600" size={16} />
                  </button>
                  <button
                    onClick={() => handleDeleteNote(note.id)}
                    className="p-1 rounded-lg hover:bg-red-100 transition-colors"
                  >
                    <Trash2 className="text-red-600" size={16} />
                  </button>
                </div>
              </div>
              
              <div className="text-gray-600 text-sm mb-4 line-clamp-4">
                {note.content && note.content.split('\n').map((line, index) => (
                  <p key={index} className="mb-1">{line}</p>
                ))}
              </div>
              
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span>
                  Criado por {state.auth.user?.id === note.user_id ? 'você' : state.auth.partner?.firstName}
                </span>
                <span>{new Date(note.updated_at).toLocaleDateString('pt-BR')}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Note Modal */}
      {showNoteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">
                {editingNote ? 'Editar Anotação' : 'Nova Anotação'}
              </h3>
              <button
                onClick={() => setShowNoteModal(false)}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleNoteSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Título
                </label>
                <input
                  type="text"
                  value={noteForm.title}
                  onChange={(e) => setNoteForm({ ...noteForm, title: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  placeholder="Título da anotação"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Conteúdo
                </label>
                <textarea
                  value={noteForm.content}
                  onChange={(e) => setNoteForm({ ...noteForm, content: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 focus:border-transparent"
                  rows={12}
                  placeholder="Escreva aqui suas ideias, lembretes ou recados..."
                  required
                />
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowNoteModal(false)}
                  className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-rose-500 to-pink-500 text-white rounded-lg hover:from-rose-600 hover:to-pink-600 transition-all"
                >
                  {editingNote ? 'Salvar Alterações' : 'Criar Anotação'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}