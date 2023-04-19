import { Component } from 'react';
import PropTypes from 'prop-types'

import MarvelService from '../../services/MarvelService';
import Spinner from '../spinner/Spinner';
import ErrorMessage from '../errorMessage/ErrorMessage';

import './charList.scss';

class CharList extends Component {
    state = {
        chars: [],
        loading: true,
        error: false,
        newItemLoading: false,
        offset: 210,
        charEnded: false
    }

    marvelService = new MarvelService();

    onError = () => {
        this.setState({
            loading: false,
            error: true
        })
    }

    onCharListLoaded = (newChars) => {
        let ended = false;
        if(newChars.length < 9) {
            ended = true;
        }
        this.setState(({chars, offset}, prevProps) => {
            return {
                chars: [...chars, ...newChars],
                loading: false,
                newItemLoading: false,
                offset: offset + 9,
                charEnded: ended
            }
        });
    }

    onCharlistLoading = () => {
        this.setState({
            newItemLoading: true
        })
    }

    componentDidMount() {
        this.onRequest();
    }

    onRequest = (offset) => {
        this.onCharlistLoading();
        this.marvelService
            .getAllCharacters(offset)
            .then(this.onCharListLoaded)
            .catch(this.onError)
    }

    itemRefs = [];

    setRef = ref => {
        this.itemRefs.push(ref);
    }

    focusOnItem = (id) => {
        this.itemRefs.forEach(item => item.classList.remove('char__item_selected'));
        this.itemRefs[id].classList.add('char__item_selected');
        this.itemRefs[id].focus();
    }




    render() {
        const {chars, loading, error, offset, newItemLoading, charEnded} = this.state
        
        const list = chars.map((char, i) => {
            const clazz = char.thumbnail.includes('image_not_available') ? {objectFit: 'unset'} : {objectFit: 'cover'};
            return (
                <li className="char__item"
                    key={char.id}
                    ref={this.setRef}
                    tabIndex={0}
                    onClick={() => {
                        this.props.onCharSelected(char.id);
                        this.focusOnItem(i);
                        }
                    }
                    onKeyPress={(e) => {
                        if (e.key === ' ' || e.key === "Enter") {
                            this.props.onCharSelected(char.id);
                            this.focusOnItem(i);
                        }
                    }}>
                        <img src={char.thumbnail} alt={char.name} style={clazz}/>
                        <div className="char__name">{char.name}</div>
                </li>
            )
        })

        const errorMessage = error ? <ErrorMessage /> : null;
        const spinner = loading? <Spinner /> : null;
        const content = !(loading || errorMessage) ? (
            <ul className="char__grid">
            {list}
            </ul>) : null;
        return (
            <div className="char__list">
                {spinner}
                {errorMessage}
                {content}
                <button 
                    style={{'display': charEnded ? 'none' : 'block'}}
                    disabled={newItemLoading}
                    onClick={() => this.onRequest(offset)}
                    className="button button__main button__long">
                    <div className="inner">load more</div>
                </button>
            </div>
        )
    }
}

CharList.propTypes = {
    onCharSelected: PropTypes.func
}

export default CharList;