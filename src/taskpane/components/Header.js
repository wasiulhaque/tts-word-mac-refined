import * as React from "react";
import PropTypes from "prop-types";

export default class Header extends React.Component {
  render() {
    const { title, logo } = this.props;

    return (
      <section className="ms-welcome__header">
        <img height="130" src={logo} alt={title} title={title} />
      </section>
    );
  }
}

Header.propTypes = {
  title: PropTypes.string,
  logo: PropTypes.string,
  message: PropTypes.string,
};
